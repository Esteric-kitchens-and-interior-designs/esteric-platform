"use client";

import type { LeadStatus } from "@repo/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateLeadStatus } from "../../actions";

const STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTE_SENT",
  "WON",
  "LOST",
];

export const LeadStatusSelect = ({
  leadId,
  status,
  disabled,
}: {
  leadId: string;
  status: LeadStatus;
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, value as LeadStatus);
        toast.success(`Status updated to ${value.replace("_", " ")}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update status."
        );
      }
    });
  };

  return (
    <Select
      disabled={disabled || isPending}
      onValueChange={onChange}
      value={status}
    >
      <SelectTrigger className="w-40" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
