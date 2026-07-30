"use server";

import { database } from "@repo/database";
import { parseError } from "@repo/observability/error";
import { protectFormSubmission } from "@/lib/protect-form";
import { newsletterSchema } from "@/lib/validation";

export interface NewsletterState {
  readonly error?: string;
  readonly success: boolean;
}

export const subscribeToNewsletter = async (
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> => {
  try {
    await protectFormSubmission("newsletter");

    const parsed = newsletterSchema.safeParse({
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Please enter a valid email address.",
      };
    }

    // Upsert so re-subscribing (or subscribing twice) never errors — it
    // just confirms the subscription, flipping status back to SUBSCRIBED
    // if someone had previously unsubscribed.
    await database.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      create: {
        email: parsed.data.email,
        source: "WEBSITE_FOOTER",
      },
      update: {
        status: "SUBSCRIBED",
        unsubscribedAt: null,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: parseError(error) };
  }
};
