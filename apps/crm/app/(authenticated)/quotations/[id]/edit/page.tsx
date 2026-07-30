import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import { QuotationForm } from "../../components/quotation-form";

interface EditQuotationPageProps {
  params: Promise<{ id: string }>;
}

const EditQuotationPage = async ({ params }: EditQuotationPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "quotations:write")) {
    redirect("/quotations");
  }

  const { id } = await params;

  const quotation = await database.quotation.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  if (!quotation) {
    notFound();
  }
  if (quotation.status !== "DRAFT") {
    redirect(`/quotations/${id}`);
  }

  const [customers, leads] = await Promise.all([
    database.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
      take: 500,
    }),
    database.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true },
      take: 200,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">
          Edit {quotation.quoteNumber}
        </h1>
        <p className="text-muted-foreground text-sm">
          Draft quotations can be edited freely until they're sent.
        </p>
      </div>
      <QuotationForm
        customers={customers.map((c) => ({
          value: c.id,
          label: c.name,
          description: c.email,
        }))}
        initialValue={{
          customerId: quotation.customerId,
          leadId: quotation.leadId,
          title: quotation.title,
          currency: quotation.currency,
          taxRate: Number(quotation.taxRate),
          discountAmount: Number(quotation.discountAmount),
          validUntil: quotation.validUntil
            ? quotation.validUntil.toISOString().slice(0, 10)
            : null,
          termsAndConditions: quotation.termsAndConditions,
          items: quotation.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        }}
        leads={leads.map((l) => ({
          value: l.id,
          label: l.name,
          description: l.email,
        }))}
        mode="edit"
        quotationId={quotation.id}
      />
    </div>
  );
};

export default EditQuotationPage;
