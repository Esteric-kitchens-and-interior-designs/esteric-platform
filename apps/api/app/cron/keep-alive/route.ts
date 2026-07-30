import { database } from "@repo/database";

// Neon's serverless free/scale-to-zero tiers suspend the compute after
// inactivity; this ping keeps it warm. Runs on a schedule (see vercel.json).
export const GET = async () => {
  await database.$queryRaw`SELECT 1`;

  return new Response("OK", { status: 200 });
};
