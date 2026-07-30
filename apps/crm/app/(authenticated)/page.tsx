import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "./components/header";
import { RevenueChart } from "./components/revenue-chart";
import { toneClass } from "./lib/badges";
import { formatCurrency, formatDate, timeAgo } from "./lib/format";

const title = "Dashboard";
const description = "Esteric Kitchens & Interior Designs CRM";

export const metadata: Metadata = {
  title,
  description,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const buildMonthlyRevenue = (
  quotations: { total: unknown; respondedAt: Date | null; createdAt: Date }[]
) => {
  const months: { key: string; label: string; total: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      total: 0,
    });
  }

  for (const q of quotations) {
    const date = new Date(q.respondedAt ?? q.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) {
      bucket.total += Number(q.total);
    }
  }

  return months;
};

const DashboardPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  const canSeeAllFollowUps = hasPermission(staffUser, "*");
  const canSeeRevenue =
    hasPermission(staffUser, "reports:read") || hasPermission(staffUser, "*");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY);
  const sevenDaysAhead = new Date(now.getTime() + 7 * MS_PER_DAY);

  const [
    newLeadsCount,
    activeProjectsCount,
    pendingQuotationsCount,
    approvedQuotationsCount,
    approvedQuotations,
    recentActivity,
    upcomingAppointments,
    followUps,
  ] = await Promise.all([
    database.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    database.project.count({ where: { status: "IN_PROGRESS" } }),
    database.quotation.count({ where: { status: { in: ["SENT", "VIEWED"] } } }),
    database.quotation.count({ where: { status: "APPROVED" } }),
    canSeeRevenue
      ? database.quotation.findMany({
          where: { status: "APPROVED" },
          select: { total: true, respondedAt: true, createdAt: true },
        })
      : Promise.resolve([]),
    database.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    database.appointmentBooking.findMany({
      where: {
        requestedDate: { gte: now, lte: sevenDaysAhead },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      orderBy: { requestedDate: "asc" },
      take: 8,
    }),
    database.followUp.findMany({
      where: {
        dueAt: { lte: now },
        completedAt: null,
        ...(canSeeAllFollowUps ? {} : { assignedToId: staffUser.id }),
      },
      orderBy: { dueAt: "asc" },
      take: 8,
      include: {
        lead: { select: { id: true, name: true, status: true } },
        customer: { select: { id: true, name: true } },
      },
    }),
  ]);

  const revenueData = buildMonthlyRevenue(approvedQuotations);
  const totalRevenue = approvedQuotations.reduce(
    (sum, q) => sum + Number(q.total),
    0
  );

  const stats = [
    {
      label: "New leads (7 days)",
      value: newLeadsCount,
      icon: UserPlus,
      href: "/leads",
    },
    {
      label: "Active projects",
      value: activeProjectsCount,
      icon: TrendingUp,
      href: "/projects",
    },
    {
      label: "Pending quotations",
      value: pendingQuotationsCount,
      icon: Clock,
      href: "/quotations",
    },
    {
      label: "Approved quotations",
      value: approvedQuotationsCount,
      icon: CheckCircle2,
      href: "/quotations",
    },
  ];

  return (
    <>
      <Header page="Dashboard" pages={[]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="font-display font-semibold text-2xl">
            Welcome back, {staffUser.firstName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here's what's happening across the business today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link href={stat.href} key={stat.label}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardDescription className="flex items-center gap-1.5">
                    <stat.icon className="h-3.5 w-3.5" />
                    {stat.label}
                  </CardDescription>
                  <CardTitle className="font-display text-3xl">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {canSeeRevenue && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue overview</CardTitle>
                <CardDescription>
                  Approved quotations by month · Total{" "}
                  {formatCurrency(totalRevenue)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>
          )}

          <Card className={canSeeRevenue ? "" : "lg:col-span-3"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" /> Recent activity
              </CardTitle>
              <CardDescription>Latest actions across the CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No activity yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {recentActivity.map((entry) => (
                    <li
                      className="flex items-start justify-between gap-2 text-sm"
                      key={entry.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate">
                          <span className="font-medium">
                            {entry.user
                              ? `${entry.user.firstName} ${entry.user.lastName}`
                              : "System"}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {entry.action}
                          </span>
                        </p>
                        {entry.description && (
                          <p className="truncate text-muted-foreground text-xs">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-muted-foreground text-xs">
                        {timeAgo(entry.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                className="mt-3 inline-block text-primary text-xs hover:underline"
                href="/activity-log"
              >
                View full activity log →
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Upcoming appointments
              </CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <Empty className="border-0 p-2">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Calendar />
                    </EmptyMedia>
                    <EmptyTitle>No upcoming appointments</EmptyTitle>
                    <EmptyDescription>
                      Confirmed and pending bookings for the next week will show
                      up here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="flex flex-col gap-3">
                  {upcomingAppointments.map((booking) => (
                    <li
                      className="flex items-center justify-between gap-2 text-sm"
                      key={booking.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{booking.name}</p>
                        <p className="truncate text-muted-foreground text-xs">
                          {formatDate(booking.requestedDate)}
                          {booking.requestedSlot
                            ? ` · ${booking.requestedSlot}`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED" ? "default" : "outline"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Needs attention
              </CardTitle>
              <CardDescription>Overdue or due-today follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              {followUps.length === 0 ? (
                <Empty className="border-0 p-2">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckCircle2 />
                    </EmptyMedia>
                    <EmptyTitle>All caught up</EmptyTitle>
                    <EmptyDescription>
                      No overdue follow-ups assigned to you right now.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="flex flex-col gap-3">
                  {followUps.map((f) => {
                    const isOverdue = f.dueAt < now;
                    let target: { label: string; href: string } | null = null;
                    if (f.lead) {
                      target = {
                        label: f.lead.name,
                        href: `/leads/${f.lead.id}`,
                      };
                    } else if (f.customer) {
                      target = {
                        label: f.customer.name,
                        href: `/customers/${f.customer.id}`,
                      };
                    }
                    return (
                      <li
                        className="flex items-center justify-between gap-2 text-sm"
                        key={f.id}
                      >
                        <div className="min-w-0">
                          {target ? (
                            <Link
                              className="truncate font-medium hover:underline"
                              href={target.href}
                            >
                              {target.label}
                            </Link>
                          ) : (
                            <p className="truncate font-medium">{f.note}</p>
                          )}
                          <p className="truncate text-muted-foreground text-xs">
                            {f.note}
                          </p>
                        </div>
                        <Badge
                          className={toneClass(isOverdue ? "red" : "amber")}
                          variant="outline"
                        >
                          {isOverdue ? "Overdue" : "Due today"}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
