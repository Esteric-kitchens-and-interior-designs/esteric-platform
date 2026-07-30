"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { PERMISSION_GROUPS, PERMISSION_LABELS } from "../../permissions";
import { createRole, updateRole } from "../actions";

interface RoleInput {
  description: string | null;
  id: string;
  isSystem: boolean;
  name: string;
  permissions: string[];
}

export const RoleFormSheet = ({ role }: { role?: RoleInput }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fullAccess, setFullAccess] = useState(
    role?.permissions.includes("*") ?? false
  );

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (role) {
          await updateRole(role.id, formData);
        } else {
          await createRole(formData);
        }
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      {role ? (
        <Button onClick={() => setOpen(true)} size="icon-sm" variant="ghost">
          <PencilIcon />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)} size="sm">
          <PlusIcon /> New role
        </Button>
      )}
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{role ? `Edit ${role.name}` : "New role"}</SheetTitle>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input defaultValue={role?.name} id="name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              defaultValue={role?.description ?? ""}
              id="description"
              name="description"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-2.5">
            <Checkbox
              checked={fullAccess}
              id="fullAccess"
              name="fullAccess"
              onCheckedChange={(v) => setFullAccess(v === true)}
            />
            <Label className="font-normal text-sm" htmlFor="fullAccess">
              Full access (Super Admin — matches every permission, including
              staff &amp; role management)
            </Label>
          </div>

          <div className={fullAccess ? "pointer-events-none opacity-40" : ""}>
            <p className="mb-2 font-medium text-sm">Permissions</p>
            <div className="flex flex-col gap-3">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 text-muted-foreground text-xs">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {group.keys.map((key) => (
                      <div className="flex items-center gap-2" key={key}>
                        <Checkbox
                          defaultChecked={role?.permissions.includes(key)}
                          disabled={fullAccess}
                          id={key}
                          name="permissions"
                          value={key}
                        />
                        <Label className="font-normal text-sm" htmlFor={key}>
                          {PERMISSION_LABELS[key]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <SheetFooter className="px-0">
            <Button disabled={isPending} type="submit">
              {isPending && "Saving…"}
              {!isPending && (role ? "Save changes" : "Create role")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
