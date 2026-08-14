import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

// sharp is a native addon used to watermark uploaded photos server-side
// (apps/crm/app/(authenticated)/api/upload-watermarked) — it must stay
// external rather than get bundled by the build. Its platform binary is
// loaded via a dynamically-computed require() path (picking the right
// @img/sharp-<platform> package at runtime), which Next's output file
// tracing can't follow statically — without outputFileTracingIncludes the
// linux-x64 binary silently gets left out of the deployed function even
// though it installs correctly, and sharp fails to load in production.
let nextConfig: NextConfig = withLogging({
  ...config,
  serverExternalPackages: [...(config.serverExternalPackages ?? []), "sharp"],
  outputFileTracingIncludes: {
    "/api/upload-watermarked/**": [
      "../../node_modules/.pnpm/sharp@*/**/*",
      "../../node_modules/.pnpm/@img+sharp-linux-x64@*/**/*",
      "../../node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**/*",
    ],
  },
});

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
