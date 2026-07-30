"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { assignLead } from "../../actions";

interface StaffOption {
  firstName: string;
  id: string;
  lastName: string;
}

export const LeadAssignSelect = ({
  leadId,
  assignedToId,
  staff,
  disabled,
}: {
  leadId: string;
  assignedToId: string | null;
  staff: StaffOption[];
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    startTransition(async () => {
      try {
        await assignLead(leadId, value === "unassigned" ? null : value);
        toast.success("Assignment updated.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to reassign lead."
        );
      }
    });
  };

  return (
    <Select
      disabled={disabled || isPending}
      onValueChange={onChange}
      value={assignedToId ?? "unassigned"}
    >
      <SelectTrigger className="w-48" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {staff.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.firstName} {s.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
