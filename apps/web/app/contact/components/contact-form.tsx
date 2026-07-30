"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { CheckCircle2, Loader2, MoveRight } from "lucide-react";
import { useActionState } from "react";
import { submitContactForm } from "@/app/contact/actions";
import { initialFormState } from "@/lib/form-state";

export const ContactForm = () => {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialFormState
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border bg-card p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
        <p className="font-display text-xl tracking-tight">Message sent</p>
        <p className="max-w-sm text-muted-foreground text-sm">
          Thank you for reaching out. Our team will get back to you within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-md border p-8"
    >
      <p className="font-display text-lg tracking-tight">Send us a message</p>
      <div className="grid gap-1">
        <Label htmlFor="name">Full name</Label>
        <Input
          disabled={isPending}
          id="name"
          name="name"
          required
          type="text"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="email">Email</Label>
        <Input
          disabled={isPending}
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input disabled={isPending} id="phone" name="phone" type="tel" />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="message">Message</Label>
        <Textarea
          disabled={isPending}
          id="message"
          name="message"
          required
          rows={5}
        />
      </div>
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
      <Button className="w-full gap-2" disabled={isPending} type="submit">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Send message <MoveRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};
