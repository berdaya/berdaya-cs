import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

interface OpenAIError extends Error {
  status?: number;
  code?: string;
}

type ThreadWithCount = {
  id: string;
  openaiId: string;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'API key is required',
        },
        { status: 400 }
      );
    }

    // Get threads from database
    const threads = await prisma.thread.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format threads for the frontend
    const formattedThreads = threads.map((thread: ThreadWithCount) => ({
      id: thread.id,
      openaiId: thread.openaiId,
      createdAt: thread.createdAt.toISOString(),
      customer: {
        id: thread.customer.id,
        name: thread.customer.name,
        email: thread.customer.email,
        phone: thread.customer.phone,
      }
    }));

    return NextResponse.json({
      success: true,
      threads: formattedThreads,
    });
  } catch (error: unknown) {
    console.error('Error listing threads:', error);
    const openAIError = error as OpenAIError;
    return NextResponse.json(
      {
        success: false,
        error: openAIError.message || 'Failed to list threads',
      },
      { status: 500 }
    );
  }
} 