import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

// sharp is a native addon used to watermark uploaded photos server-side
// (apps/crm/app/(authenticated)/api/upload-watermarked) — it must stay
// external rather than get bundled by the build.
//
// outputFileTracingIncludes pointing at the pnpm store was tried here to
// force-include sharp's linux binary (its platform binary is loaded via a
// dynamically-computed require() path that Next's tracer can't follow
// statically), but it broke Vercel's own deploy-output packaging step
// outright (every deploy failed at "Deploying outputs..." with an opaque
// platform error, both with a broad and a narrowed glob) — removed rather
// than left half-working. See conversation history for the sharp-on-Vercel
// investigation; a pure-JS/WASM watermarking library is the likely next
// step rather than fighting native-binary tracing further.
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
