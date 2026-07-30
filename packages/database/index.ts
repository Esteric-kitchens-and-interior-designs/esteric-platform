import "server-only";

import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client";
import { keys } from "./keys";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// HTTP (fetch-based) adapter, not the WebSocket Pool adapter: WebSocket
// connections are unreliable in Vercel's serverless Node.js runtime
// ("Unexpected server response: 101" on cold starts) and we don't use
// Prisma's interactive $transaction callback form, so HTTP is a strict
// improvement here — one request per query, no persistent connection.
const adapter = new PrismaNeonHttp(keys().DATABASE_URL, {});

export const database = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}

export * from "./generated/client";
