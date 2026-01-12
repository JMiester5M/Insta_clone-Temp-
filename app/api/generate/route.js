import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Call OpenAI DALL·E 2 API
    const response = await openai.images.generate({
      model: 'dall-e-2',
      prompt: prompt.trim(),
      size: '512x512',
      n: 1,
    });

    // Extract imageUrl from OpenAI response
    const imageUrl = response.data[0].url;

    // Return imageUrl and prompt
    return NextResponse.json({
      imageUrl,
      prompt: prompt.trim(),
    });
  } catch (error) {
    // Handle and log OpenAI errors gracefully
    console.error('Error generating image:', error);

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
