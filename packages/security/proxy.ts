import { defaults, type Options, withVercelToolbar } from "@nosecone/next";

export { createMiddleware as securityMiddleware } from "@nosecone/next";

// Nosecone security headers configuration
// https://docs.arcjet.com/nosecone/quick-start
export const noseconeOptions: Options = {
  ...defaults,
  // Content Security Policy (CSP) is disabled by default because the values
  // depend on which Next Forge features are enabled. See
  // https://www.next-forge.com/packages/security/headers for guidance on how
  // to configure it.
  contentSecurityPolicy: false,
  // Cross-Origin-Embedder-Policy defaults to "require-corp", which blocks
  // any cross-origin resource (e.g. hero/portfolio photos served from
  // Vercel Blob's public CDN) that doesn't send its own
  // Cross-Origin-Resource-Policy header — Blob doesn't send one. Neither
  // app uses SharedArrayBuffer or other cross-origin-isolation-gated APIs
  // that COEP exists to protect, so it's disabled rather than worked around
  // per-<img>/<Image> tag.
  crossOriginEmbedderPolicy: false,
};

export const noseconeOptionsWithToolbar: Options =
  withVercelToolbar(noseconeOptions);
