import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import { TestimonialForm } from "../components/testimonial-form";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

const EditTestimonialPage = async ({ params }: EditTestimonialPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { id } = await params;

  const [testimonial, portfolioProjects] = await Promise.all([
    database.testimonial.findUnique({ where: { id } }),
    database.portfolioProject.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
      take: 200,
    }),
  ]);

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">
          {testimonial.customerName}
        </h1>
      </div>
      <div className="max-w-2xl">
        <TestimonialForm
          initialValue={{
            customerName: testimonial.customerName,
            quote: testimonial.quote,
            rating: testimonial.rating,
            photoUrl: testimonial.photoUrl,
            portfolioProjectId: testimonial.portfolioProjectId,
            isFeatured: testimonial.isFeatured,
            isPublished: testimonial.isPublished,
          }}
          mode="edit"
          portfolioProjects={portfolioProjects.map((p) => ({
            value: p.id,
            label: p.title,
          }))}
          testimonialId={testimonial.id}
        />
      </div>
    </div>
  );
};

export default EditTestimonialPage;
