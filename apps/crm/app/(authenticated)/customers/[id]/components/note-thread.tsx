"use client";

import {
  Avatar,
  AvatarFallback,
} from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { initials, timeAgo } from "../../../lib/format";
import { addCustomerNote } from "../../actions";

interface Note {
  author: { firstName: string; lastName: string };
  body: string;
  createdAt: Date;
  id: string;
}

export const CustomerNoteThread = ({
  customerId,
  notes,
}: {
  customerId: string;
  notes: Note[];
}) => {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState("");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await addCustomerNote(customerId, formData);
        setValue("");
        formRef.current?.reset();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add note.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form action={handleSubmit} className="flex flex-col gap-2" ref={formRef}>
        <Textarea
          name="body"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          value={value}
        />
        <Button
          className="self-end"
          disabled={isPending || value.trim().length === 0}
          size="sm"
          type="submit"
        >
          {isPending ? "Adding…" : "Add note"}
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li className="flex gap-3" key={note.id}>
              <Avatar className="h-7 w-7 text-xs">
                <AvatarFallback>
                  {initials(`${note.author.firstName} ${note.author.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 rounded-md border bg-muted/30 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm">
                    {note.author.firstName} {note.author.lastName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {timeAgo(note.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{note.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
