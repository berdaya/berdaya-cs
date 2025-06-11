import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatbotId = searchParams.get('id');

    if (!chatbotId) {
      return NextResponse.json({
        valid: false,
        error: 'Chatbot ID is required'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Initialize OpenAI client with environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get assistant details from OpenAI
    const assistant = await openai.beta.assistants.retrieve(chatbotId);

    // Return basic chatbot information
    return NextResponse.json({
      valid: true,
      name: assistant.name,
      model: assistant.model,
      tools: assistant.tools,
      temperature: assistant.temperature,
      top_p: assistant.top_p,
      response_format: assistant.response_format,
      file_ids: assistant.tool_resources?.file_search?.vector_store_ids || []
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('Error verifying chatbot:', error);
    return NextResponse.json({
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to verify chatbot'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 