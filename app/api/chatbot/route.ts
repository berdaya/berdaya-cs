import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

interface OpenAIError extends Error {
  status?: number;
  code?: string;
}

const errorResponse = (message: string, details: unknown = null, status = 400) => {
  return NextResponse.json(
    { error: message, details },
    {
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
};

export async function POST(request: Request) {
  try {
    const { chatbot_id, customer, messages } = await request.json();

    if (!chatbot_id) {
      return errorResponse('Chatbot ID is required');
    }

    // Initialize OpenAI with API key from environment
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("Processing message for chatbot:", chatbot_id);
    console.log("Customer info:", { name: customer.name, email: customer.email, phone: customer.phone });

    // Get or create customer
    const getOrCreateCustomer = async () => {
      let customerRecord = await prisma.customer.findFirst({
        where: {
          OR: [
            { email: customer.email || undefined },
            { phone: customer.phone || undefined }
          ]
        },
      });

      if (!customerRecord) {
        console.log('Creating new customer record');
        customerRecord = await prisma.customer.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        });
      } else {
        console.log('Updating existing customer record');
        // Update customer if any information has changed
        customerRecord = await prisma.customer.update({
          where: { id: customerRecord.id },
          data: {
            name: customer.name || customerRecord.name,
            phone: customer.phone || customerRecord.phone,
          },
        });
      }
      return customerRecord;
    };

    // Parallelize customer and thread creation
    const [customerRecord, openaiThread] = await Promise.all([
      getOrCreateCustomer(),
      openai.beta.threads.create(),
    ]);
    console.log('Created OpenAI thread:', openaiThread.id);

    const thread = await prisma.thread.create({
      data: {
        openaiId: openaiThread.id,
        customerId: customerRecord.id,
      },
    });
    console.log('Created database thread:', thread.id);

    // Add message to OpenAI thread
    console.log('Adding message to thread:', messages[0]);
    const message = await openai.beta.threads.messages.create(thread.openaiId, {
      role: 'user',
      content: messages[0],
    });
    console.log('Message added:', message.id);

    // Create a run
    console.log('Creating run with assistant:', chatbot_id);
    const run = await openai.beta.threads.runs.create(thread.openaiId, {
      assistant_id: chatbot_id,
    });
    console.log('Run created:', run.id);

    // Create a streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Function to send SSE data
    interface SSEData {
      type: 'done' | 'error' | 'chunk';
      session_id?: string;
      message?: {
        id: string;
        role: string;
        content: string;
        createdAt: string;
      };
      error?: string;
      content?: string;
    }

    const sendSSE = async (data: SSEData) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // Start the run monitoring in the background
    (async () => {
      try {
        // Wait for the run to complete with optimized polling
        let runStatus;
        let retryCount = 0;
        const maxRetries = 20;
        const delay = 300; // Fixed 300ms delay

        do {
          await new Promise(resolve => setTimeout(resolve, delay));
          
          runStatus = await openai.beta.threads.runs.retrieve(
            run.id,
            { thread_id: thread.openaiId }
          );
          console.log('Run status:', runStatus.status);
          
          retryCount++;
        } while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && retryCount < maxRetries);

        if (runStatus.status === 'completed') {
          console.log('Run completed, fetching messages');
          // Get the assistant's response
          const assistantMessages = await openai.beta.threads.messages.list(thread.openaiId);
          const assistantMessage = assistantMessages.data[0];
          console.log('Got assistant message:', assistantMessage.id);

          const content = assistantMessage.content[0].type === 'text' 
            ? assistantMessage.content[0].text.value 
            : '';

          // Stream the content in chunks for better UX
          const words = content.split(' ');
          let accumulatedContent = '';
          
          for (let i = 0; i < words.length; i++) {
            accumulatedContent += (i > 0 ? ' ' : '') + words[i];
            
            await sendSSE({
              type: 'chunk',
              content: accumulatedContent
            });
            
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 30));
          }

          // Send the final complete message
          await sendSSE({
            type: 'done',
            session_id: thread.id,
            message: {
              id: assistantMessage.id,
              role: assistantMessage.role,
              content: content,
              createdAt: new Date(assistantMessage.created_at * 1000).toISOString(),
            }
          });
        } else {
          console.error('Run failed with status:', runStatus.status);
          await sendSSE({
            type: 'error',
            error: `Run failed with status: ${runStatus.status}`
          });
        }
      } catch (error) {
        console.error('Error in run monitoring:', error);
        await sendSSE({
          type: 'error',
          error: error instanceof Error ? error.message : 'Failed to process message'
        });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: unknown) {
    console.error('Error in chatbot endpoint:', error);
    const openAIError = error as OpenAIError;
    return errorResponse(openAIError.message || 'Failed to process message', error, 500);
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}