import { prisma } from './prisma';

/**
 * Database capabilities for PublishedImage operations
 */

// Create published images
export async function createPublishedImage(data: {
  imageUrl: string;
  prompt: string;
}) {
  return await prisma.publishedImage.create({
    data: {
      imageUrl: data.imageUrl,
      prompt: data.prompt,
      // hearts and createdAt use schema defaults
    },
  });
}

// Read single image by ID
export async function getPublishedImageById(id: number) {
  return await prisma.publishedImage.findUnique({
    where: { id },
  });
}

// Read multiple images (feed)
export async function getPublishedImages(options?: {
  skip?: number;
  take?: number;
  orderBy?: 'newest' | 'oldest';
}) {
  const { skip = 0, take = 10, orderBy = 'newest' } = options || {};
  
  return await prisma.publishedImage.findMany({
    skip,
    take,
    orderBy: {
      createdAt: orderBy === 'newest' ? 'desc' : 'asc',
    },
  });
}

// Update image hearts
export async function updateImageHearts(id: number, hearts: number) {
  return await prisma.publishedImage.update({
    where: { id },
    data: { hearts },
  });
}

// Delete images (optional/admin)
export async function deletePublishedImage(id: number) {
  return await prisma.publishedImage.delete({
    where: { id },
  });
}

// Count total images
export async function countPublishedImages() {
  return await prisma.publishedImage.count();
}

// Support pagination with skip and take - implemented in getPublishedImages

// Order images by newest first - implemented in getPublishedImages
