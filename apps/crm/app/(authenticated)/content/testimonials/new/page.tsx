import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { TestimonialForm } from "../components/testimonial-form";

const NewTestimonialPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:write")) {
    redirect("/content/testimonials");
  }

  const portfolioProjects = await database.portfolioProject.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">New testimonial</h1>
      </div>
      <div className="max-w-2xl">
        <TestimonialForm
          mode="create"
          portfolioProjects={portfolioProjects.map((p) => ({
            value: p.id,
            label: p.title,
          }))}
        />
      </div>
    </div>
  );
};

export default NewTestimonialPage;
