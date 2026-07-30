"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { CheckIcon } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { toneClass } from "../../../lib/badges";
import { formatDateTime } from "../../../lib/format";
import { addLeadFollowUp, completeLeadFollowUp } from "../../actions";

interface StaffOption {
  firstName: string;
  id: string;
  lastName: string;
}

interface FollowUp {
  assignedTo: { firstName: string; lastName: string };
  completedAt: Date | null;
  dueAt: Date;
  id: string;
  note: string;
}

export const LeadFollowUpList = ({
  leadId,
  followUps,
  staff,
  currentUserId,
}: {
  leadId: string;
  followUps: FollowUp[];
  staff: StaffOption[];
  currentUserId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const now = new Date();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await addLeadFollowUp(leadId, formData);
        formRef.current?.reset();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add reminder."
        );
      }
    });
  };

  const handleComplete = (followUpId: string) => {
    startTransition(async () => {
      try {
        await completeLeadFollowUp(leadId, followUpId);
        toast.success("Follow-up marked complete.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to complete follow-up."
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form action={handleSubmit} className="flex flex-col gap-2" ref={formRef}>
        <Textarea name="note" placeholder="Reminder note…" required rows={2} />
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="w-auto"
            defaultValue={new Date().toISOString().slice(0, 16)}
            name="dueAt"
            required
            type="datetime-local"
          />
          <Select defaultValue={currentUserId} name="assignedToId">
            <SelectTrigger className="w-44" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={isPending} size="sm" type="submit">
            Add reminder
          </Button>
        </div>
      </form>

      {followUps.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No follow-ups scheduled.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {followUps.map((f) => {
            const isOverdue = !f.completedAt && f.dueAt < now;
            const isDueToday =
              !(f.completedAt || isOverdue) &&
              f.dueAt.toDateString() === now.toDateString();
            return (
              <li
                className="flex items-start justify-between gap-2 rounded-md border p-2.5"
                key={f.id}
              >
                <div className="min-w-0">
                  <p className="text-sm">{f.note}</p>
                  <p className="text-muted-foreground text-xs">
                    Due {formatDateTime(f.dueAt)} · {f.assignedTo.firstName}{" "}
                    {f.assignedTo.lastName}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {f.completedAt ? (
                    <Badge className={toneClass("green")} variant="outline">
                      Done
                    </Badge>
                  ) : (
                    <>
                      {(isOverdue || isDueToday) && (
                        <Badge
                          className={toneClass(isOverdue ? "red" : "amber")}
                          variant="outline"
                        >
                          {isOverdue ? "Overdue" : "Due today"}
                        </Badge>
                      )}
                      <Button
                        disabled={isPending}
                        onClick={() => handleComplete(f.id)}
                        size="icon-sm"
                        variant="outline"
                      >
                        <CheckIcon />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
