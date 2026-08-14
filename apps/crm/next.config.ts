import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

// Photo watermarking (apps/crm/app/(authenticated)/api/upload-watermarked)
// uses @repo/storage's Jimp-based watermark.ts, not sharp — sharp's native
// binary repeatedly failed to load on Vercel in this pnpm + Turbopack
// monorepo, and forcing it in via outputFileTracingIncludes broke Vercel's
// deploy packaging outright. sharp itself remains a dependency only for the
// one-off scripts/migrate-static-images.ts script, which runs locally via
// tsx and never goes through this build, so no serverExternalPackages entry
// is needed for it here.
let nextConfig: NextConfig = withLogging({
  ...config,
});

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
