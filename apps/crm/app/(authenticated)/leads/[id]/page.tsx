import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
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
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { Separator } from "@repo/design-system/components/ui/separator";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/header";
import { formatDate } from "../../lib/format";
import { LeadAssignSelect } from "./components/assign-select";
import { ConvertToCustomerButton } from "./components/convert-button";
import { LeadFollowUpList } from "./components/followup-list";
import { LeadNoteThread } from "./components/note-thread";
import { LeadPrioritySelect } from "./components/priority-select";
import { LeadStatusSelect } from "./components/status-select";

interface LeadDetailPageProperties {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params,
}: LeadDetailPageProperties): Promise<Metadata> => {
  const { id } = await params;
  const lead = await database.lead.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: lead ? lead.name : "Lead" };
};

const LeadDetailPage = async ({ params }: LeadDetailPageProperties) => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (!hasPermission(staffUser, "leads:read")) {
    return (
      <>
        <Header page="Lead" pages={["Leads"]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                You don't have permission to view this lead.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const { id } = await params;

  const [lead, staff] = await Promise.all([
    database.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
        convertedCustomer: { select: { id: true, name: true } },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { firstName: true, lastName: true } } },
        },
        followUps: {
          orderBy: { dueAt: "asc" },
          include: {
            assignedTo: { select: { firstName: true, lastName: true } },
          },
        },
        quotations: {
          select: {
            id: true,
            quoteNumber: true,
            title: true,
            status: true,
            total: true,
          },
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          select: { id: true, requestedDate: true, status: true },
          orderBy: { requestedDate: "desc" },
        },
      },
    }),
    database.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!lead) {
    notFound();
  }

  const canWrite = hasPermission(staffUser, "leads:write");

  return (
    <>
      <Header page={lead.name} pages={["Leads"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-semibold text-2xl">{lead.name}</h1>
            <p className="text-muted-foreground text-sm">
              {lead.email}
              {lead.phone ? ` · ${lead.phone}` : ""}
            </p>
          </div>
          {canWrite && !lead.convertedCustomerId && (
            <ConvertToCustomerButton leadId={lead.id} />
          )}
          {lead.convertedCustomer && (
            <Link
              className="text-primary text-sm hover:underline"
              href={`/customers/${lead.convertedCustomer.id}`}
            >
              View customer: {lead.convertedCustomer.name} →
            </Link>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStatusSelect
                disabled={!canWrite}
                leadId={lead.id}
                status={lead.status}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm">
                Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadPrioritySelect
                disabled={!canWrite}
                leadId={lead.id}
                priority={lead.priority}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm">
                Assigned to
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadAssignSelect
                assignedToId={lead.assignedToId}
                disabled={!canWrite}
                leadId={lead.id}
                staff={staff}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lead details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-xs">Source</p>
                  <p>{lead.source.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Service</p>
                  <p>{lead.serviceCategory?.replace("_", " ") ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Budget range</p>
                  <p>{lead.budgetRange ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p>{formatDate(lead.createdAt)}</p>
                </div>
              </div>
              {lead.message && (
                <>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-xs">Message</p>
                    <p className="whitespace-pre-wrap">{lead.message}</p>
                  </div>
                </>
              )}
              {lead.quotations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Quotations
                    </p>
                    <ul className="flex flex-col gap-1">
                      {lead.quotations.map((q) => (
                        <li key={q.id}>
                          <Link
                            className="text-primary hover:underline"
                            href={`/quotations/${q.id}`}
                          >
                            {q.quoteNumber} — {q.title}
                          </Link>{" "}
                          <span className="text-muted-foreground text-xs">
                            {q.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadFollowUpList
                currentUserId={staffUser.id}
                followUps={lead.followUps}
                leadId={lead.id}
                staff={staff}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadNoteThread leadId={lead.id} notes={lead.notes} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LeadDetailPage;
