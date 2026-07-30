import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import type { LeadSource, LeadStatus, Priority, Prisma } from "@repo/database";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
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
import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/header";
import { leadStatusTone, priorityTone, toneClass } from "../lib/badges";
import { formatDate } from "../lib/format";
import { LeadFilters } from "./components/lead-filters";
import { LeadFormSheet } from "./components/lead-form-sheet";

export const metadata: Metadata = {
  title: "Leads",
  description: "Leads pipeline",
};

interface LeadsPageProperties {
  searchParams: Promise<{
    status?: string;
    source?: string;
    priority?: string;
    assignedTo?: string;
  }>;
}

const LeadsPage = async ({ searchParams }: LeadsPageProperties) => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (!hasPermission(staffUser, "leads:read")) {
    return (
      <>
        <Header page="Leads" pages={[]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                You don't have permission to view leads.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const { status, source, priority, assignedTo } = await searchParams;

  const where: Prisma.LeadWhereInput = {
    ...(status ? { status: status as LeadStatus } : {}),
    ...(source ? { source: source as LeadSource } : {}),
    ...(priority ? { priority: priority as Priority } : {}),
    ...(assignedTo === "me" ? { assignedToId: staffUser.id } : {}),
  };

  const [leads, staff] = await Promise.all([
    database.lead.findMany({
      where,
      include: { assignedTo: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    database.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const canWrite = hasPermission(staffUser, "leads:write");

  return (
    <>
      <Header page="Leads" pages={[]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <LeadFilters />
          {canWrite && <LeadFormSheet staff={staff} />}
        </div>

        {leads.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No leads found</EmptyTitle>
              <EmptyDescription>
                Try clearing filters, or create a new lead to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow className="cursor-pointer" key={lead.id}>
                    <TableCell>
                      <Link className="block" href={`/leads/${lead.id}`}>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {lead.email}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.source.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={toneClass(leadStatusTone[lead.status])}
                        variant="outline"
                      >
                        {lead.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={toneClass(priorityTone[lead.priority])}
                        variant="outline"
                      >
                        {lead.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.assignedTo
                        ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                        : "Unassigned"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default LeadsPage;
