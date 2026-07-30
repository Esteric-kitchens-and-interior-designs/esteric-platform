import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { ProjectForm } from "../components/project-form";

interface NewProjectPageProps {
  searchParams: Promise<{ quotationId?: string }>;
}

const NewProjectPage = async ({ searchParams }: NewProjectPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "projects:write")) {
    redirect("/projects");
  }

  const { quotationId } = await searchParams;

  const [customers, approvedQuotations, prefill] = await Promise.all([
    database.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
      take: 500,
    }),
    database.quotation.findMany({
      where: { status: "APPROVED", project: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, quoteNumber: true, title: true, customerId: true },
      take: 200,
    }),
    quotationId
      ? database.quotation.findUnique({
          where: { id: quotationId },
          select: { id: true, customerId: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">New project</h1>
        <p className="text-muted-foreground text-sm">
          Kick off a project from scratch, or convert an approved quotation.
        </p>
      </div>
      <div className="max-w-3xl">
        <ProjectForm
          customers={customers.map((c) => ({
            value: c.id,
            label: c.name,
            description: c.email,
          }))}
          initialCustomerId={prefill?.customerId ?? null}
          initialQuotationId={prefill?.id ?? null}
          initialTitle={prefill?.title ?? null}
          quotations={approvedQuotations.map((q) => ({
            value: q.id,
            label: q.quoteNumber,
            description: q.title,
          }))}
        />
      </div>
    </div>
  );
};

export default NewProjectPage;
