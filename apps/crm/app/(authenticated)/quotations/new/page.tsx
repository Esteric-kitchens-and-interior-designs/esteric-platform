import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { QuotationForm } from "../components/quotation-form";

const NewQuotationPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "quotations:write")) {
    redirect("/quotations");
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
        <h1 className="font-display font-semibold text-2xl">New quotation</h1>
        <p className="text-muted-foreground text-sm">
          Build a line-item quotation. It saves as a draft until you send it to
          the customer.
        </p>
      </div>
      <QuotationForm
        customers={customers.map((c) => ({
          value: c.id,
          label: c.name,
          description: c.email,
        }))}
        leads={leads.map((l) => ({
          value: l.id,
          label: l.name,
          description: l.email,
        }))}
        mode="create"
      />
    </div>
  );
};

export default NewQuotationPage;
