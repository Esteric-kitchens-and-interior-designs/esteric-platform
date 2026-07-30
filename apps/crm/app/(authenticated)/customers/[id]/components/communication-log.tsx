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
import { ArrowDownLeftIcon, ArrowUpRightIcon, PlusIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { formatDateTime } from "../../../lib/format";
import { addCommunication } from "../../actions";

const CHANNELS = ["EMAIL", "PHONE", "WHATSAPP", "SMS", "MEETING", "OTHER"];

interface CommunicationEntry {
  body: string | null;
  channel: string;
  direction: string;
  id: string;
  occurredAt: Date;
  staff: { firstName: string; lastName: string };
  subject: string | null;
}

export const CommunicationLog = ({
  customerId,
  communications,
}: {
  customerId: string;
  communications: CommunicationEntry[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await addCommunication(customerId, formData);
        formRef.current?.reset();
        setShowForm(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to log communication."
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <form
          action={handleSubmit}
          className="flex flex-col gap-2 rounded-md border p-3"
          ref={formRef}
        >
          <div className="flex flex-wrap gap-2">
            <Select defaultValue="EMAIL" name="channel">
              <SelectTrigger className="w-36" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="OUTBOUND" name="direction">
              <SelectTrigger className="w-32" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUTBOUND">Outbound</SelectItem>
                <SelectItem value="INBOUND">Inbound</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="w-auto"
              defaultValue={new Date().toISOString().slice(0, 16)}
              name="occurredAt"
              type="datetime-local"
            />
          </div>
          <Input name="subject" placeholder="Subject (optional)" />
          <Textarea name="body" placeholder="Details…" rows={2} />
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowForm(false)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={isPending} size="sm" type="submit">
              {isPending ? "Logging…" : "Log communication"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          className="self-start"
          onClick={() => setShowForm(true)}
          size="sm"
          variant="outline"
        >
          <PlusIcon /> Log communication
        </Button>
      )}

      {communications.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No communication history yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {communications.map((c) => (
            <li
              className="flex items-start gap-3 rounded-md border p-2.5"
              key={c.id}
            >
              {c.direction === "INBOUND" ? (
                <ArrowDownLeftIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ArrowUpRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.channel}</Badge>
                    <span className="font-medium text-sm">
                      {c.subject ?? c.direction}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(c.occurredAt)}
                  </span>
                </div>
                {c.body && (
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
                )}
                <p className="mt-1 text-muted-foreground text-xs">
                  Logged by {c.staff.firstName} {c.staff.lastName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
