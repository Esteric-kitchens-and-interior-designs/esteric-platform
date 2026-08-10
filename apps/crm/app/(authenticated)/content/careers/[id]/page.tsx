import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import { JobPostingForm } from "../components/job-posting-form";

interface EditJobPostingPageProps {
  params: Promise<{ id: string }>;
}

const EditJobPostingPage = async ({ params }: EditJobPostingPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { id } = await params;

  const posting = await database.jobPosting.findUnique({ where: { id } });

  if (!posting) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">{posting.title}</h1>
        <p className="text-muted-foreground text-sm">/careers/{posting.slug}</p>
      </div>
      <div className="max-w-3xl">
        <JobPostingForm
          initialValue={{
            title: posting.title,
            slug: posting.slug,
            department: posting.department,
            location: posting.location,
            employmentType: posting.employmentType,
            description: posting.description,
            requirements: posting.requirements,
            status: posting.status,
          }}
          mode="edit"
          postingId={posting.id}
        />
      </div>
    </div>
  );
};

export default EditJobPostingPage;
