"use client";

import type { ServiceCategory } from "@repo/database/generated/enums";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { CheckCircle2, Loader2, MoveRight } from "lucide-react";
import { useActionState, useState } from "react";
import { submitQuoteRequest } from "@/app/quote/actions";
import { initialFormState } from "@/lib/form-state";
import { serviceCategoryLabels, services } from "@/lib/services";
import { budgetRanges } from "@/lib/site-config";

interface QuoteFormProps {
  readonly defaultService?: ServiceCategory;
}

export const QuoteForm = ({ defaultService }: QuoteFormProps) => {
  const [state, formAction, isPending] = useActionState(
    submitQuoteRequest,
    initialFormState
  );
  const [serviceCategory, setServiceCategory] = useState(defaultService ?? "");
  const [budgetRange, setBudgetRange] = useState("");

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border bg-card p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
        <p className="font-display text-xl tracking-tight">
          Quote request received
        </p>
        <p className="max-w-sm text-muted-foreground text-sm">
          Thank you — a member of our design team will review your project and
          follow up within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-md border bg-card p-8"
    >
      <input name="serviceCategory" type="hidden" value={serviceCategory} />
      <input name="budgetRange" type="hidden" value={budgetRange} />

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input disabled={isPending} id="phone" name="phone" type="tel" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="serviceCategory-trigger">Service</Label>
          <Select
            disabled={isPending}
            onValueChange={setServiceCategory}
            value={serviceCategory}
          >
            <SelectTrigger className="w-full" id="serviceCategory-trigger">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.category} value={service.category}>
                  {service.title}
                </SelectItem>
              ))}
              <SelectItem value="OTHER">
                {serviceCategoryLabels.OTHER}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="budgetRange-trigger">Estimated budget</Label>
        <Select
          disabled={isPending}
          onValueChange={setBudgetRange}
          value={budgetRange}
        >
          <SelectTrigger className="w-full" id="budgetRange-trigger">
            <SelectValue placeholder="Select a budget range" />
          </SelectTrigger>
          <SelectContent>
            {budgetRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="message">Tell us about your project</Label>
        <Textarea
          disabled={isPending}
          id="message"
          name="message"
          placeholder="Space, style, timeline — anything that helps us understand your project."
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
            Submit Quote Request <MoveRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};
