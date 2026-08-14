import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

// Hero/service/portfolio photography is served from Vercel Blob (watermarked
// at upload time) — next/image needs the store's hostname allow-listed.
let nextConfig: NextConfig = withLogging({
  ...config,
  images: {
    ...config.images,
    remotePatterns: [
      ...(config.images?.remotePatterns ?? []),
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
});

if (process.env.NODE_ENV === "production") {
  const redirects: NextConfig["redirects"] = async () => [
    {
      source: "/legal",
      destination: "/legal/privacy",
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
