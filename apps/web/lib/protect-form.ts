import "server-only";

import { createRateLimiter, slidingWindow } from "@repo/rate-limit";
import { secure } from "@repo/security";
import { headers } from "next/headers";
import { env } from "@/env";

/**
 * Shared abuse protection for public form server actions (contact, quote,
 * appointment, newsletter). Mirrors the pattern used by the CRM's
 * authenticated layout (`apps/crm/app/(authenticated)/layout.tsx`), but
 * since these forms have no signed-in user we block bots outright instead
 * of allowlisting a preview-bot category, and layer a per-IP sliding
 * window on top via `@repo/rate-limit`.
 *
 * Throws when the request should be rejected — callers should catch and
 * surface `parseError(error)` to the user.
 */
export const protectFormSubmission = async (formKey: string): Promise<void> => {
  if (env.ARCJET_KEY) {
    // No bot categories allowed — this is a public form endpoint, not a
    // page that search engines or preview bots need to hit.
    await secure([]);
  }

  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const rateLimiter = createRateLimiter({
      limiter: slidingWindow(5, "1h"),
      prefix: `esteric_${formKey}`,
    });
    const head = await headers();
    const ip = head.get("x-forwarded-for") ?? "unknown";
    const { success } = await rateLimiter.limit(`${formKey}_${ip}`);

    if (!success) {
      throw new Error(
        "You've submitted this form too many times recently. Please try again later or contact us directly."
      );
    }
  }
};
