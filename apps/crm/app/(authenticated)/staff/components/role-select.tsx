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
import { changeUserRole } from "../actions";

interface RoleOption {
  id: string;
  name: string;
}

export const UserRoleSelect = ({
  userId,
  roleId,
  roles,
  disabled,
}: {
  userId: string;
  roleId: string;
  roles: RoleOption[];
  disabled?: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    startTransition(async () => {
      try {
        await changeUserRole(userId, value);
        toast.success("Role updated.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update role."
        );
      }
    });
  };

  return (
    <Select
      disabled={disabled || isPending}
      onValueChange={onChange}
      value={roleId}
    >
      <SelectTrigger className="w-44" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
