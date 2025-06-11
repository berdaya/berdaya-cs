import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

interface OpenAIError extends Error {
  status?: number;
  code?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    // Get thread from database to get OpenAI thread ID
    const thread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thread not found',
        },
        { status: 404 }
      );
    }

    // Initialize OpenAI with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Get messages from OpenAI
    const messages = await openai.beta.threads.messages.list(thread.openaiId);

    // Format messages for the frontend
    const formattedMessages = messages.data.map(message => ({
      id: message.id,
      role: message.role,
      content: message.content[0].type === 'text' ? message.content[0].text.value : '',
      createdAt: new Date(message.created_at * 1000).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error: unknown) {
    console.error('Error fetching messages:', error);
    const openAIError = error as OpenAIError;
    return NextResponse.json(
      {
        success: false,
        error: openAIError.message || 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}