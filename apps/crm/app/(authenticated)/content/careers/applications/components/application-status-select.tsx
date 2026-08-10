"use client";

import type { JobApplicationStatus } from "@repo/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateJobApplicationStatus } from "../../actions";

const STATUSES: JobApplicationStatus[] = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
];

export const ApplicationStatusSelect = ({
  applicationId,
  status,
  disabled,
}: {
  applicationId: string;
  status: JobApplicationStatus;
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    startTransition(async () => {
      try {
        await updateJobApplicationStatus(
          applicationId,
          value as JobApplicationStatus
        );
        toast.success(`Status updated to ${value}`);
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
      <SelectTrigger className="w-36" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
