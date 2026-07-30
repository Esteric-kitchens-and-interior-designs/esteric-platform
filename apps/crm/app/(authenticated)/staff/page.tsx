import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/header";
import { toneClass, userStatusTone } from "../lib/badges";
import { formatDateTime, timeAgo } from "../lib/format";
import { UserRoleSelect } from "./components/role-select";
import { UserStatusToggle } from "./components/status-toggle";

export const metadata: Metadata = {
  title: "Staff",
  description: "Staff & role management",
};

const StaffPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (!hasPermission(staffUser, "*")) {
    return (
      <>
        <Header page="Staff & Roles" pages={[]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldAlert />
              </EmptyMedia>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                Staff & role management is restricted to Super Admins.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const [users, roles] = await Promise.all([
    database.user.findMany({
      include: { role: true },
      orderBy: { firstName: "asc" },
    }),
    database.role.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Header page="Staff & Roles" pages={[]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {users.length} staff account{users.length === 1 ? "" : "s"}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/staff/roles">Manage roles</Link>
          </Button>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {user.firstName} {user.lastName}
                      {user.role.name === "Super Admin" && (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleSelect
                      disabled={user.id === staffUser.id}
                      roleId={user.roleId}
                      roles={roles}
                      userId={user.id}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={toneClass(userStatusTone[user.status])}
                      variant="outline"
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Never"}
                    {user.lastLoginAt && (
                      <div className="text-xs">
                        {formatDateTime(user.lastLoginAt)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserStatusToggle
                      disabled={user.id === staffUser.id}
                      name={`${user.firstName} ${user.lastName}`}
                      status={user.status}
                      userId={user.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default StaffPage;
