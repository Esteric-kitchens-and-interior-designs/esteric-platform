import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import type { Prisma } from "@repo/database";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";
import { History, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/header";
import { formatDateTime, summarizeUserAgent } from "../lib/format";
import { ActivityLogFilters } from "./components/filters";

export const metadata: Metadata = {
  title: "Activity Log",
  description: "Audit trail of every CRM mutation",
};

const userIdFilter = (
  userId: string | undefined
): Prisma.ActivityLogWhereInput => {
  if (userId === "system") {
    return { userId: null };
  }
  if (userId) {
    return { userId };
  }
  return {};
};

const PAGE_SIZE = 25;

interface ActivityLogPageProperties {
  searchParams: Promise<{
    userId?: string;
    entityType?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

const ENTITY_ROUTES: Record<string, (id: string) => string> = {
  Lead: (id) => `/leads/${id}`,
  Customer: (id) => `/customers/${id}`,
  Quotation: (id) => `/quotations/${id}`,
  Project: (id) => `/projects/${id}`,
};

const ActivityLogPage = async ({ searchParams }: ActivityLogPageProperties) => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (
    !(hasPermission(staffUser, "reports:read") || hasPermission(staffUser, "*"))
  ) {
    return (
      <>
        <Header page="Activity Log" pages={[]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShieldAlert />
              </EmptyMedia>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                Viewing the audit trail requires reporting access.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const { userId, entityType, from, to, page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const where: Prisma.ActivityLogWhereInput = {
    ...userIdFilter(userId),
    ...(entityType ? { entityType } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [entries, total, users, entityTypes] = await Promise.all([
    database.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    database.activityLog.count({ where }),
    database.user.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
    database.activityLog
      .findMany({ distinct: ["entityType"], select: { entityType: true } })
      .then((rows) => rows.map((r) => r.entityType).sort()),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (userId) {
      params.set("userId", userId);
    }
    if (entityType) {
      params.set("entityType", entityType);
    }
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }
    params.set("page", String(targetPage));
    return `/activity-log?${params.toString()}`;
  };

  return (
    <>
      <Header page="Activity Log" pages={[]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ActivityLogFilters entityTypes={entityTypes} users={users} />

        {entries.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <History />
              </EmptyMedia>
              <EmptyTitle>No activity found</EmptyTitle>
              <EmptyDescription>Try adjusting your filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const link = entry.entityId
                      ? ENTITY_ROUTES[entry.entityType]?.(entry.entityId)
                      : undefined;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDateTime(entry.createdAt)}
                        </TableCell>
                        <TableCell>
                          {entry.user ? (
                            <>
                              <div className="text-sm">
                                {entry.user.firstName} {entry.user.lastName}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {entry.user.email}
                              </div>
                            </>
                          ) : (
                            <Badge variant="outline">System</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {entry.action}
                        </TableCell>
                        <TableCell>
                          {link ? (
                            <Link
                              className="text-primary text-sm hover:underline"
                              href={link}
                            >
                              {entry.entityType}
                            </Link>
                          ) : (
                            <span className="text-sm">{entry.entityType}</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-64 truncate text-sm">
                          {entry.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {entry.ipAddress ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{summarizeUserAgent(entry.userAgent)}</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-64 break-words">
                              {entry.userAgent ?? "Unknown"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                Page {page} of {totalPages} · {total} total events
              </p>
              <div className="flex gap-2">
                {page <= 1 ? (
                  <Button disabled size="sm" variant="outline">
                    Previous
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildPageHref(page - 1)}>Previous</Link>
                  </Button>
                )}
                {page >= totalPages ? (
                  <Button disabled size="sm" variant="outline">
                    Next
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link href={buildPageHref(page + 1)}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ActivityLogPage;
