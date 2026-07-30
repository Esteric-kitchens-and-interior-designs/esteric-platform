"use client";

import type { ServiceCategory } from "@repo/database/generated/enums";
import { Button } from "@repo/design-system/components/ui/button";
import { Calendar } from "@repo/design-system/components/ui/calendar";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Loader2, MoveRight } from "lucide-react";
import { useActionState, useState } from "react";
import { submitAppointmentRequest } from "@/app/appointment/actions";
import { initialFormState } from "@/lib/form-state";
import { serviceCategoryLabels, services } from "@/lib/services";
import { appointmentSlots } from "@/lib/site-config";

interface AppointmentFormProps {
  readonly defaultService?: ServiceCategory;
}

export const AppointmentForm = ({ defaultService }: AppointmentFormProps) => {
  const [state, formAction, isPending] = useActionState(
    submitAppointmentRequest,
    initialFormState
  );
  const [serviceCategory, setServiceCategory] = useState(defaultService ?? "");
  const [slot, setSlot] = useState("");
  const [date, setDate] = useState<Date | undefined>();

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border bg-card p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
        <p className="font-display text-xl tracking-tight">
          Appointment requested
        </p>
        <p className="max-w-sm text-muted-foreground text-sm">
          Thank you — we'll confirm your appointment by email or phone shortly.
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
      <input name="requestedSlot" type="hidden" value={slot} />
      <input
        name="requestedDate"
        type="hidden"
        value={date ? date.toISOString() : ""}
      />

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="date-trigger">Preferred date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={isPending}
                id="date-trigger"
                type="button"
                variant="outline"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Choose a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                disabled={{ before: new Date() }}
                mode="single"
                onSelect={setDate}
                selected={date}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid gap-1">
          <Label htmlFor="slot-trigger">Preferred time</Label>
          <Select disabled={isPending} onValueChange={setSlot} value={slot}>
            <SelectTrigger className="w-full" id="slot-trigger">
              <SelectValue placeholder="Select a time slot" />
            </SelectTrigger>
            <SelectContent>
              {appointmentSlots.map((slotOption) => (
                <SelectItem key={slotOption} value={slotOption}>
                  {slotOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea disabled={isPending} id="notes" name="notes" rows={4} />
      </div>

      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button
        className="w-full gap-2"
        disabled={isPending || !date}
        type="submit"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Request Appointment <MoveRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};
