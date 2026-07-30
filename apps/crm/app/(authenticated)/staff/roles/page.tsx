import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { ArrowLeftIcon, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../components/header";
import { PERMISSION_LABELS, type PermissionKey } from "../permissions";
import { RoleFormSheet } from "./components/role-form-sheet";

export const metadata: Metadata = {
  title: "Roles",
  description: "Role & permission management",
};

const PermissionBadges = ({ permissions }: { permissions: string[] }) => {
  if (permissions.includes("*")) {
    return <Badge>Full access</Badge>;
  }
  if (permissions.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">No permissions</span>
    );
  }
  return (
    <>
      {permissions.map((p) => (
        <Badge key={p} variant="outline">
          {PERMISSION_LABELS[p as PermissionKey] ?? p}
        </Badge>
      ))}
    </>
  );
};

const RolesPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (!hasPermission(staffUser, "*")) {
    return (
      <>
        <Header page="Roles" pages={["Staff & Roles"]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldAlert />
              </EmptyMedia>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                Role management is restricted to Super Admins.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const roles = await database.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Header page="Roles" pages={["Staff & Roles"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <Button asChild size="sm" variant="ghost">
            <Link href="/staff">
              <ArrowLeftIcon /> Back to staff
            </Link>
          </Button>
          <RoleFormSheet />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {role.name}
                    {role.isSystem && <Badge variant="outline">System</Badge>}
                  </CardTitle>
                  {role.description && (
                    <p className="mt-1 text-muted-foreground text-sm">
                      {role.description}
                    </p>
                  )}
                  <p className="mt-1 text-muted-foreground text-xs">
                    {role._count.users} user{role._count.users === 1 ? "" : "s"}
                  </p>
                </div>
                <RoleFormSheet
                  role={{
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    permissions: role.permissions,
                    isSystem: role.isSystem,
                  }}
                />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  <PermissionBadges permissions={role.permissions} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default RolesPage;
