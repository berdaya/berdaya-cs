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
    
    if (!file) {
      return errorResponse('No file provided');
    }

    // Check if file is a .txt file
    if (!file.name.toLowerCase().endsWith('.txt')) {
      return errorResponse('Only .txt files are allowed');
    }

    // Initialize OpenAI client with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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