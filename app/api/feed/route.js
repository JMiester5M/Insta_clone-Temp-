import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Parse and set defaults
    let page = pageParam ? parseInt(pageParam, 10) : 1;
    let limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate pagination inputs
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    // Enforce max limit of 50
    if (limit > 50) {
      limit = 50;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count of images
    const total = await prisma.publishedImage.count();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    // Fetch images ordered by newest first
    const images = await prisma.publishedImage.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format images with ISO date strings
    const formattedImages = images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      prompt: image.prompt,
      hearts: image.hearts,
      createdAt: image.createdAt.toISOString(),
    }));

    // Return paginated response
    // Handle empty database and out-of-range pages gracefully
    return NextResponse.json({
      images: formattedImages,
      total,
      page,
      totalPages: totalPages || 1,
    });
  } catch (error) {
    // Handle and log database errors
    console.error('Error fetching feed:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { id, hearts } = body;

    // Validate id (required number)
    if (id === undefined || id === null || typeof id !== 'number' || !Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'id is required and must be a number' },
        { status: 400 }
      );
    }

    // Validate hearts (required non-negative integer)
    if (hearts === undefined || hearts === null || typeof hearts !== 'number' || !Number.isInteger(hearts) || hearts < 0) {
      return NextResponse.json(
        { error: 'hearts is required and must be a non-negative integer' },
        { status: 400 }
      );
    }

    // Update hearts using atomic Prisma update
    // This will automatically ensure image exists (throws if not found)
    const updatedImage = await prisma.publishedImage.update({
      where: { id },
      data: { hearts },
    });

    // Return updated image object
    return NextResponse.json({
      id: updatedImage.id,
      imageUrl: updatedImage.imageUrl,
      prompt: updatedImage.prompt,
      hearts: updatedImage.hearts,
      createdAt: updatedImage.createdAt.toISOString(),
    });
  } catch (error) {
    // Handle and log database errors
    console.error('Error updating hearts:', error);

    // Handle case where image doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update hearts' },
      { status: 500 }
    );
  }
}
