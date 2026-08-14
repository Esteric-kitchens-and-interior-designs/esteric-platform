"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/design-system/components/ui/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface ContentDeleteButtonProps {
  deleteAction: (id: string) => Promise<void>;
  entityLabel: string;
  id: string;
  redirectTo: string;
}

export const ContentDeleteButton = ({
  deleteAction,
  entityLabel,
  id,
  redirectTo,
}: ContentDeleteButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="text-destructive hover:text-destructive"
          disabled={isPending}
          size="sm"
          variant="outline"
        >
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {entityLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            This can't be undone. It's removed from the public site immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              startTransition(async () => {
                try {
                  await deleteAction(id);
                  router.push(redirectTo);
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Failed to delete"
                  );
                }
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
