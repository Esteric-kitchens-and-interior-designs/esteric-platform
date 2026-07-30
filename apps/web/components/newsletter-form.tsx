"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useActionState } from "react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

const initialState = { success: false, error: undefined };

interface NewsletterFormProps {
  readonly className?: string;
}

export const NewsletterForm = ({ className }: NewsletterFormProps) => {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    initialState
  );

  if (state.success) {
    return (
      <p className={className ?? "text-foreground/75 text-sm"}>
        You&apos;re subscribed — thank you for following along.
      </p>
    );
  }

  return (
    <div className={className ?? "flex w-full max-w-sm flex-col gap-2"}>
      <form action={formAction} className="flex w-full gap-2">
        <Input
          aria-label="Email address"
          className="bg-background/10"
          disabled={isPending}
          name="email"
          placeholder="Your email address"
          required
          type="email"
        />
        <Button disabled={isPending} type="submit" variant="secondary">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Subscribe</span>
        </Button>
      </form>
      {state.error ? (
        <p className="text-destructive text-xs">{state.error}</p>
      ) : null}
    </div>
  );
};
