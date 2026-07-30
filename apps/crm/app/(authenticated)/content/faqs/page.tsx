import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { HelpCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { FaqDeleteButton } from "./components/faq-delete-button";
import { FaqDialog } from "./components/faq-dialog";

const FaqsListPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const faqs = await database.fAQ.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const canWrite = hasPermission(staffUser, "content:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">FAQs</h1>
          <p className="text-muted-foreground text-sm">
            Frequently asked questions shown on the public site.
          </p>
        </div>
        {canWrite ? <FaqDialog mode="create" /> : null}
      </div>

      {faqs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HelpCircle />
            </EmptyMedia>
            <EmptyTitle>No FAQs yet</EmptyTitle>
            <EmptyDescription>Add your first question.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="divide-y rounded-lg border">
          {faqs.map((faq) => (
            <div
              className="flex items-start justify-between gap-4 p-4"
              key={faq.id}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{faq.question}</p>
                  {faq.category ? (
                    <Badge variant="outline">{faq.category}</Badge>
                  ) : null}
                  <Badge variant={faq.isPublished ? "default" : "outline"}>
                    {faq.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground text-sm">
                  {faq.answer}
                </p>
              </div>
              {canWrite ? (
                <div className="flex items-center gap-1">
                  <FaqDialog
                    faqId={faq.id}
                    initialValue={{
                      question: faq.question,
                      answer: faq.answer,
                      category: faq.category,
                      isPublished: faq.isPublished,
                    }}
                    mode="edit"
                  />
                  <FaqDeleteButton faqId={faq.id} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaqsListPage;
