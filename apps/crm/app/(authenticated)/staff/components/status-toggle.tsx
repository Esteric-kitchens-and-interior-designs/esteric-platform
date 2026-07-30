"use client";

import type { UserStatus } from "@repo/database";
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
import { useTransition } from "react";
import { toast } from "sonner";
import { toggleUserStatus } from "../actions";

export const UserStatusToggle = ({
  userId,
  status,
  name,
  disabled,
}: {
  userId: string;
  status: UserStatus;
  name: string;
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();
  const nextStatus: UserStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleUserStatus(userId, nextStatus);
        toast.success(
          nextStatus === "ACTIVE"
            ? `${name} activated.`
            : `${name} deactivated.`
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update status."
        );
      }
    });
  };

  if (nextStatus === "ACTIVE") {
    return (
      <Button
        disabled={disabled || isPending}
        onClick={handleToggle}
        size="sm"
        variant="outline"
      >
        {isPending ? "Activating…" : "Activate"}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled || isPending} size="sm" variant="outline">
          Deactivate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They'll immediately lose access to the CRM. This is the supported
            way to remove staff — accounts are never hard-deleted since other
            records reference them. You can reactivate them later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleToggle}>
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
