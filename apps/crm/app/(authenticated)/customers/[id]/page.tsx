import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/header";
import {
  projectStatusTone,
  quotationStatusTone,
  toneClass,
} from "../../lib/badges";
import { formatCurrency, formatDate } from "../../lib/format";
import { CommunicationLog } from "./components/communication-log";
import { CustomerNoteThread } from "./components/note-thread";

interface CustomerDetailPageProperties {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params,
}: CustomerDetailPageProperties): Promise<Metadata> => {
  const { id } = await params;
  const customer = await database.customer.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: customer ? customer.name : "Customer" };
};

const CustomerDetailPage = async ({ params }: CustomerDetailPageProperties) => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (!hasPermission(staffUser, "customers:read")) {
    return (
      <>
        <Header page="Customer" pages={["Customers"]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                You don't have permission to view this customer.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const { id } = await params;

  const customer = await database.customer.findUnique({
    where: { id },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      quotations: { orderBy: { createdAt: "desc" } },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { firstName: true, lastName: true } } },
      },
      communications: {
        orderBy: { occurredAt: "desc" },
        include: { staff: { select: { firstName: true, lastName: true } } },
      },
      fromLead: { select: { id: true } },
    },
  });

  if (!customer) {
    notFound();
  }

  const address = [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.region,
    customer.postalCode,
    customer.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Header page={customer.name} pages={["Customers"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-semibold text-2xl">
              {customer.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {customer.email}
              {customer.phone ? ` · ${customer.phone}` : ""}
              {customer.company ? ` · ${customer.company}` : ""}
            </p>
            {address && (
              <p className="text-muted-foreground text-sm">{address}</p>
            )}
          </div>
          {customer.fromLead && (
            <Link
              className="text-primary text-sm hover:underline"
              href={`/leads/${customer.fromLead.id}`}
            >
              View originating lead →
            </Link>
          )}
        </div>

        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">
              Projects ({customer.projects.length})
            </TabsTrigger>
            <TabsTrigger value="quotations">
              Quotations ({customer.quotations.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({customer.notes.length})
            </TabsTrigger>
            <TabsTrigger value="communications">
              Communications ({customer.communications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
            <Card>
              <CardContent className="pt-6">
                {customer.projects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No projects yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {customer.projects.map((project) => (
                      <li key={project.id}>
                        <Link
                          className="flex items-center justify-between gap-2 rounded-md border p-2.5 hover:bg-muted/40"
                          href={`/projects/${project.id}`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-sm">
                              {project.projectNumber} — {project.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {project.completionPercentage}% complete
                            </p>
                          </div>
                          <Badge
                            className={toneClass(
                              projectStatusTone[project.status]
                            )}
                            variant="outline"
                          >
                            {project.status.replace("_", " ")}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotations">
            <Card>
              <CardContent className="pt-6">
                {customer.quotations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No quotations yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {customer.quotations.map((q) => (
                      <li key={q.id}>
                        <Link
                          className="flex items-center justify-between gap-2 rounded-md border p-2.5 hover:bg-muted/40"
                          href={`/quotations/${q.id}`}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-sm">
                              {q.quoteNumber} — {q.title}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatDate(q.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {formatCurrency(Number(q.total), q.currency)}
                            </span>
                            <Badge
                              className={toneClass(
                                quotationStatusTone[q.status]
                              )}
                              variant="outline"
                            >
                              {q.status}
                            </Badge>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <CustomerNoteThread
                  customerId={customer.id}
                  notes={customer.notes}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Communication history
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommunicationLog
                  communications={customer.communications}
                  customerId={customer.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CustomerDetailPage;
