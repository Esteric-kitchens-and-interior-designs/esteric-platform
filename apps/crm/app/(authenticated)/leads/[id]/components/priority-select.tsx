"use client";

import type { Priority } from "@repo/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateLeadPriority } from "../../actions";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export const LeadPrioritySelect = ({
  leadId,
  priority,
  disabled,
}: {
  leadId: string;
  priority: Priority;
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    startTransition(async () => {
      try {
        await updateLeadPriority(leadId, value as Priority);
        toast.success(`Priority updated to ${value}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update priority."
        );
      }
    });
  };

  return (
    <Select
      disabled={disabled || isPending}
      onValueChange={onChange}
      value={priority}
    >
      <SelectTrigger className="w-32" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRIORITIES.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
