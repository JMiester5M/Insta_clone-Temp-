import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Configure WebSocket support for Node.js
neonConfig.webSocketConstructor = ws;

// Create connection pool (using Pool, not Client) for better performance
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL environment variable is missing or empty.\n' +
    'Possible causes:\n' +
    '- .env file is missing or not in the project root\n' +
    '- .env file does not contain DATABASE_URL=...\n' +
    '- You need to restart your dev server after editing .env\n' +
    'If you are using a deployment platform, ensure DATABASE_URL is set in your environment variables.'
  );
}

const pool = new Pool({ connectionString });

// Create Neon adapter with the pool
const adapter = new PrismaNeon(pool);

// Singleton pattern to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
