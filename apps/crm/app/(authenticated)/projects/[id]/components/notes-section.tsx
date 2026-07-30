"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addProjectNote } from "../../actions";
import { formatDate } from "../../lib/helpers";

interface Note {
  author: { firstName: string; lastName: string };
  body: string;
  createdAt: Date;
  id: string;
}

export const NotesSection = ({
  projectId,
  notes,
}: {
  projectId: string;
  notes: Note[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");

  const handleAdd = () => {
    if (!body.trim()) {
      toast.error("Note body is required");
      return;
    }
    startTransition(async () => {
      try {
        await addProjectNote(projectId, body);
        setBody("");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add note");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add an internal note (not visible to the customer)…"
            rows={3}
            value={body}
          />
          <Button
            disabled={isPending}
            onClick={handleAdd}
            size="sm"
            type="button"
          >
            Add note
          </Button>
        </div>
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li className="border-b pb-3 last:border-0" key={note.id}>
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>
                    {note.author.firstName} {note.author.lastName}
                  </span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{note.body}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
