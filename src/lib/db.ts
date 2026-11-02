import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';
import ws from 'ws';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  // Many home and office networks silently drop Postgres traffic on port 5432, which
  // leaves every query hanging. For local development, reach Neon through its
  // WebSocket proxy on port 443 instead. Production (Vercel) keeps the direct connection.
  if (!isProduction && connectionString?.includes('.neon.tech')) {
    neonConfig.webSocketConstructor = ws;
    return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Fail with an error rather than hanging the request if the database is unreachable.
    connectionTimeoutMillis: 15000,
  });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export default db;
