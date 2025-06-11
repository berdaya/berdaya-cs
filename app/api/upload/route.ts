import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Helper for error responses
const errorResponse = (message: string, details: unknown = null, status = 400) => {
  return NextResponse.json({
    error: message,
    details
  }, { status });
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const apiKey = formData.get('openai_api_key') as string;
    
    if (!file) {
      return errorResponse('No file provided');
    }

    if (!apiKey) {
      return errorResponse('OpenAI API key is required');
    }

    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Upload file to OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    return NextResponse.json({ file_id: uploadedFile.id });
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to upload file',
      error,
      500
    );
  }
} 