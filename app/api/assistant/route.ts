import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface OpenAIError extends Error {
  status?: number;
  code?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      instructions,
      model,
      temperature,
      top_p,
      response_format,
      file_ids,
      openai_api_key,
    } = body;

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openai_api_key,
    });

    let vectorStoreId: string | null = null;

    // Step 1: Create vector store if files are provided
    if (file_ids && file_ids.length > 0) {
      const vectorStore = await openai.vectorStores.create({
        name: `${name} Vector Store`,
      });

      // Step 2: Add files to vector store
      for (const fileId of file_ids) {
        await openai.vectorStores.files.create(vectorStore.id, {
          file_id: fileId,
        });
      }

      vectorStoreId = vectorStore.id;
    }

    // Step 3: Create assistant
    const assistant = await openai.beta.assistants.create({
      name,
      instructions,
      model,
      tools: file_ids?.length ? [{ type: 'file_search' }] : [],
      temperature,
      top_p,
      response_format,
    });

    // Step 4: Update assistant to use vector store if files were provided
    if (vectorStoreId) {
      await openai.beta.assistants.update(assistant.id, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId],
          },
        },
      });
    }

    // Return the assistant data
    return NextResponse.json({
      success: true,
      data: {
        id: assistant.id,
        name: assistant.name,
        instructions: assistant.instructions,
        model: assistant.model,
        tools: assistant.tools,
        temperature: assistant.temperature,
        top_p: assistant.top_p,
        response_format: assistant.response_format,
        file_ids: file_ids || [],
        openai_api_key,
        vectorStoreId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('Error creating assistant:', error);
    const openAIError = error as OpenAIError;
    return NextResponse.json(
      {
        success: false,
        error: openAIError.message || 'Failed to create assistant',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Since we're not using a database, we'll need to store the API key somewhere
    // For now, we'll use an environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const assistants = await openai.beta.assistants.list();
    
    return NextResponse.json({
      success: true,
      data: assistants.data.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        instructions: assistant.instructions,
        model: assistant.model,
        tools: assistant.tools,
        temperature: assistant.temperature,
        top_p: assistant.top_p,
        response_format: assistant.response_format,
        createdAt: new Date().toISOString(),
      })),
    });
  } catch (error: unknown) {
    console.error('Error fetching assistants:', error);
    const openAIError = error as OpenAIError;
    return NextResponse.json(
      {
        success: false,
        error: openAIError.message || 'Failed to fetch assistants',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assistant ID is required',
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get assistant details to check for vector store
    const assistant = await openai.beta.assistants.retrieve(id);
    
    // Delete vector store if it exists
    if (assistant.tool_resources?.file_search?.vector_store_ids) {
      for (const vectorStoreId of assistant.tool_resources.file_search.vector_store_ids) {
        await openai.vectorStores.delete(vectorStoreId);
      }
    }

    // Delete assistant
    await openai.beta.assistants.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Assistant deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting assistant:', error);
    const openAIError = error as OpenAIError;
    return NextResponse.json(
      {
        success: false,
        error: openAIError.message || 'Failed to delete assistant',
      },
      { status: 500 }
    );
  }
}
