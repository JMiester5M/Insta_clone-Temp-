import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { imageUrl, prompt, userId, userName } = body;

    // Validate imageUrl (required, non-empty string)
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
      return NextResponse.json(
        { error: 'imageUrl is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate prompt (required but may be empty string)
    if (prompt === undefined || prompt === null || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate userId (required)
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string' },
        { status: 401 }
      );
    }

    // Persist image using Prisma
    // hearts and createdAt use schema defaults
    const publishedImage = await prisma.publishedImage.create({
      data: {
        imageUrl: imageUrl.trim(),
        prompt: prompt,
        userId: userId,
        userName: userName || null,
      },
    });

    // Return full created object
    return NextResponse.json({
      id: publishedImage.id,
      imageUrl: publishedImage.imageUrl,
      prompt: publishedImage.prompt,
      hearts: publishedImage.hearts,
      createdAt: publishedImage.createdAt.toISOString(),
      userId: publishedImage.userId,
      userName: publishedImage.userName,
    });
  } catch (error) {
    // Handle and log database errors
    console.error('Error publishing image:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to publish image' },
      { status: 500 }
    );
  }
}
