import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Helper for error responses
const errorResponse = (message: string, details: unknown = null, status = 400) => {
  return NextResponse.json({
    error: message,
    details
  }, { status });
};

// Create a new assistant
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, instructions, model, tools, temperature, top_p, response_format, file_ids, openai_api_key } = data;

    if (!openai_api_key) {
      return errorResponse('OpenAI API key is required');
    }

    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({
      apiKey: openai_api_key,
    });

    // Create the assistant in OpenAI
    const openaiAssistant = await openai.beta.assistants.create({
      name,
      instructions,
      model,
      tools: tools.map((tool: string) => {
        if (tool === 'retrieval') {
          return { type: 'file_search' };
        }
        return { type: tool };
      }),
      temperature,
      top_p,
      response_format,
    });

    // Store the assistant configuration in our database
    const assistant = await prisma.assistant.create({
      data: {
        openaiId: openaiAssistant.id,
        name,
        instructions,
        model,
        tools,
        temperature,
        topP: top_p,
        responseFormat: response_format,
        fileIds: file_ids || [],
        openaiApiKey: openai_api_key,
      },
    });

    return NextResponse.json(assistant);
  } catch (error) {
    console.error('Error creating assistant:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create assistant',
      error,
      500
    );
  }
}

// Update an existing assistant
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get('id');
    
    if (!assistantId) {
      return errorResponse('Assistant ID is required');
    }

    const data = await request.json();
    const { name, instructions, model, tools, temperature, top_p, response_format, file_ids, openai_api_key } = data;

    if (!openai_api_key) {
      return errorResponse('OpenAI API key is required');
    }

    // Get the assistant from our database
    const existingAssistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
    });

    if (!existingAssistant) {
      return errorResponse('Assistant not found', null, 404);
    }

    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({
      apiKey: openai_api_key,
    });

    // Update the assistant in OpenAI
    await openai.beta.assistants.update(existingAssistant.openaiId, {
      name,
      instructions,
      model,
      tools: tools.map((tool: string) => {
        if (tool === 'retrieval') {
          return { type: 'file_search' };
        }
        return { type: tool };
      }),
      temperature,
      top_p,
      response_format,
    });

    // Update the assistant configuration in our database
    const assistant = await prisma.assistant.update({
      where: { id: assistantId },
      data: {
        name,
        instructions,
        model,
        tools,
        temperature,
        topP: top_p,
        responseFormat: response_format,
        fileIds: file_ids || [],
        openaiApiKey: openai_api_key,
      },
    });

    return NextResponse.json(assistant);
  } catch (error) {
    console.error('Error updating assistant:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update assistant',
      error,
      500
    );
  }
}

// Delete an assistant
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get('id');
    
    if (!assistantId) {
      return errorResponse('Assistant ID is required');
    }

    // Get the assistant from our database
    const existingAssistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
    });

    if (!existingAssistant) {
      return errorResponse('Assistant not found', null, 404);
    }

    // Initialize OpenAI client with the stored API key
    const openai = new OpenAI({
      apiKey: existingAssistant.openaiApiKey,
    });

    // Delete the assistant from OpenAI
    await openai.beta.assistants.delete(existingAssistant.openaiId);

    // Delete the assistant from our database
    await prisma.assistant.delete({
      where: { id: assistantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to delete assistant',
      error,
      500
    );
  }
}

// List all assistants
export async function GET() {
  try {
    const assistants = await prisma.assistant.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ data: assistants });
  } catch (error) {
    console.error('Error listing assistants:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to list assistants',
      error,
      500
    );
  }
} 