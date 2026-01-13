import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Read cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader
        .split('; ')
        .filter(Boolean)
        .map((c) => {
          const [k, ...v] = c.split('=');
          return [k, v.join('=')];
        })
    );
    let userId = cookies['user_id'];
    if (!userId) {
      userId = Math.random().toString(36).slice(2);
    }
    // Rate limit: allow only 1 request per 30 seconds per user
    const lastRequestKey = `last_generate_${userId}`;
    const lastRequest = cookies[lastRequestKey];
    const now = Date.now();
    if (lastRequest && now - parseInt(lastRequest, 10) < 30000) {
      const wait = Math.ceil((30000 - (now - parseInt(lastRequest, 10))) / 1000);
      return NextResponse.json(
        { error: `Please wait ${wait} more second(s) before generating another image.` },
        { status: 429 }
      );
    }
    // Parse request body
    const body = await request.json();
    const { prompt } = body;
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
    const imageUrl = response.data[0].url;
    // Set cookies for userId and lastRequestKey
    const res = NextResponse.json({ imageUrl, prompt: prompt.trim() });
    res.headers.append('Set-Cookie', `user_id=${userId}; Path=/; Max-Age=${60 * 60 * 24 * 30}`);
    res.headers.append('Set-Cookie', `${lastRequestKey}=${now}; Path=/; Max-Age=${60 * 60 * 24 * 30}`);
    return res;
  } catch (error) {
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
