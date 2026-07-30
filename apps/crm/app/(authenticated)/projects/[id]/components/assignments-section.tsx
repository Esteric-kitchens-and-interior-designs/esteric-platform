"use client";

import {
  Avatar,
  AvatarFallback,
} from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Combobox,
  type ComboboxOption,
} from "../../../quotations/components/combobox";
import { addProjectAssignment, removeProjectAssignment } from "../../actions";

interface Assignment {
  id: string;
  roleOnProject: string;
  user: { id: string; firstName: string; lastName: string };
}

interface AssignmentsSectionProps {
  assignments: Assignment[];
  projectId: string;
  staffOptions: ComboboxOption[];
}

export const AssignmentsSection = ({
  projectId,
  assignments,
  staffOptions,
}: AssignmentsSectionProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userId, setUserId] = useState<string | null>(null);
  const [roleOnProject, setRoleOnProject] = useState("");

  const handleAdd = () => {
    if (!(userId && roleOnProject.trim())) {
      toast.error("Select a staff member and a role");
      return;
    }
    startTransition(async () => {
      try {
        await addProjectAssignment(projectId, userId, roleOnProject);
        setUserId(null);
        setRoleOnProject("");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to add assignment"
        );
      }
    });
  };

  const handleRemove = (assignmentId: string) => {
    startTransition(async () => {
      try {
        await removeProjectAssignment(projectId, assignmentId);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to remove assignment"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No staff assigned yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {assignments.map((assignment) => (
              <li
                className="flex items-center justify-between gap-2"
                key={assignment.id}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback>
                      {assignment.user.firstName[0]}
                      {assignment.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {assignment.user.firstName} {assignment.user.lastName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {assignment.roleOnProject}
                  </span>
                </div>
                <Button
                  disabled={isPending}
                  onClick={() => handleRemove(assignment.id)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-2 border-t pt-3">
          <Combobox
            emptyText="No staff found."
            onChange={setUserId}
            options={staffOptions}
            placeholder="Select staff member"
            value={userId}
          />
          <Input
            onChange={(event) => setRoleOnProject(event.target.value)}
            placeholder="Role on project (e.g. Lead Designer)"
            value={roleOnProject}
          />
          <Button
            className="w-full"
            disabled={isPending}
            onClick={handleAdd}
            size="sm"
            type="button"
            variant="outline"
          >
            Add to team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
