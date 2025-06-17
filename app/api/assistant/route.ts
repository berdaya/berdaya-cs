import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface OpenAIError extends Error {
  status?: number;
  code?: string;
}

interface FileInfo {
  id: string;
  filename: string;
  status: string;
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
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const assistants = await openai.beta.assistants.list();
    
    // Fetch file information for each assistant
    const assistantsWithFiles = await Promise.all(assistants.data.map(async (assistant) => {
      let fileInfo: FileInfo[] = [];
      
      if (assistant.tool_resources?.file_search?.vector_store_ids) {
        const vectorStoreId = assistant.tool_resources.file_search.vector_store_ids[0];
        if (vectorStoreId) {
          try {
            const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
            const files = await openai.vectorStores.files.list(vectorStoreId);
            
            // Fetch file details for each file
            fileInfo = await Promise.all(files.data.map(async (file) => {
              const fileDetails = await openai.files.retrieve(file.id);
              return {
                id: file.id,
                filename: fileDetails.filename,
                status: file.status
              };
            }));
          } catch (error) {
            console.error('Error fetching vector store files:', error);
          }
        }
      }

      return {
        id: assistant.id,
        name: assistant.name,
        instructions: assistant.instructions,
        model: assistant.model,
        tools: assistant.tools,
        temperature: assistant.temperature,
        top_p: assistant.top_p,
        response_format: assistant.response_format,
        vectorStoreId: assistant.tool_resources?.file_search?.vector_store_ids?.[0] || null,
        file_ids: assistant.tool_resources?.file_search?.vector_store_ids || [],
        files: fileInfo,
        createdAt: new Date().toISOString(),
      };
    }));
    
    return NextResponse.json({
      success: true,
      data: assistantsWithFiles,
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
