"use client";

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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { createLead } from "../actions";

interface StaffOption {
  firstName: string;
  id: string;
  lastName: string;
}

const SOURCES = [
  "WEBSITE",
  "QUOTE_FORM",
  "CONTACT_FORM",
  "APPOINTMENT_FORM",
  "PHONE",
  "REFERRAL",
  "WALK_IN",
  "SOCIAL_MEDIA",
  "OTHER",
];

const SERVICE_CATEGORIES = [
  "KITCHEN",
  "INTERIOR",
  "LANDSCAPING",
  "WARDROBES_CABINETS",
  "OTHER",
];

export const LeadFormSheet = ({ staff }: { staff: StaffOption[] }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createLead(formData);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)} size="sm">
        <PlusIcon /> New Lead
      </Button>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>New lead</SheetTitle>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" required type="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source">Source</Label>
            <Select defaultValue="WEBSITE" name="source">
              <SelectTrigger className="w-full" id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="serviceCategory">Service category</Label>
            <Select name="serviceCategory">
              <SelectTrigger className="w-full" id="serviceCategory">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budgetRange">Budget range</Label>
            <Input
              id="budgetRange"
              name="budgetRange"
              placeholder="e.g. KES 500k - 1M"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assignedToId">Assign to</Label>
            <Select name="assignedToId">
              <SelectTrigger className="w-full" id="assignedToId">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={3} />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <SheetFooter className="px-0">
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating…" : "Create lead"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
