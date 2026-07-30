"use client";

import type { ProjectStatus } from "@repo/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateProjectStatus } from "../../actions";
import { projectStatusLabel } from "../../lib/helpers";

export const ProjectStatusSelect = ({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatus;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          try {
            await updateProjectStatus(projectId, value as ProjectStatus);
            toast.success("Project status updated");
            router.refresh();
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to update status"
            );
          }
        });
      }}
      value={status}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(projectStatusLabel).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
