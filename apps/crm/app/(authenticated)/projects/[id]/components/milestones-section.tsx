"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Input } from "@repo/design-system/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addProjectMilestone, toggleProjectMilestone } from "../../actions";
import { formatDate } from "../../lib/helpers";

interface Milestone {
  completedAt: Date | null;
  dueDate: Date | null;
  id: string;
  name: string;
}

export const MilestonesSection = ({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("A milestone name is required");
      return;
    }
    startTransition(async () => {
      try {
        await addProjectMilestone(projectId, name, dueDate || null);
        setName("");
        setDueDate("");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add milestone"
        );
      }
    });
  };

  const handleToggle = (milestoneId: string, completed: boolean) => {
    startTransition(async () => {
      try {
        await toggleProjectMilestone(projectId, milestoneId, completed);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update milestone"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.length === 0 ? (
          <p className="text-muted-foreground text-sm">No milestones yet.</p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((milestone) => (
              <li className="flex items-center gap-3" key={milestone.id}>
                <Checkbox
                  checked={!!milestone.completedAt}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    handleToggle(milestone.id, checked === true)
                  }
                />
                <div className="flex-1">
                  <p
                    className={
                      milestone.completedAt
                        ? "text-muted-foreground text-sm line-through"
                        : "text-sm"
                    }
                  >
                    {milestone.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Due {formatDate(milestone.dueDate)}
                    {milestone.completedAt
                      ? ` — completed ${formatDate(milestone.completedAt)}`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 border-t pt-3">
          <Input
            className="flex-1"
            onChange={(event) => setName(event.target.value)}
            placeholder="Milestone name"
            value={name}
          />
          <Input
            className="w-40"
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
          <Button
            disabled={isPending}
            onClick={handleAdd}
            size="sm"
            type="button"
            variant="outline"
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
