import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

// sharp is a native addon used to watermark uploaded photos server-side
// (apps/crm/app/(authenticated)/api/upload-watermarked) — it must stay
// external rather than get bundled by the build.
let nextConfig: NextConfig = withLogging({
  ...config,
  serverExternalPackages: [...(config.serverExternalPackages ?? []), "sharp"],
});

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
