import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Badge } from "@repo/design-system/components/ui/badge";
import { createMetadata } from "@repo/seo/metadata";
import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobPostingBySlug } from "@/lib/queries";
import { ApplyForm } from "./components/apply-form";

const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

interface JobPostingPageProps {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: JobPostingPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const posting = await getJobPostingBySlug(slug);

  if (!posting) {
    return {};
  }

  return createMetadata({
    title: posting.title,
    description: `${posting.title} — join Esteric Kitchens & Interior Designs.`,
  });
};

const JobPostingPage = async ({ params }: JobPostingPageProps) => {
  const { slug } = await params;
  const posting = await getJobPostingBySlug(slug);

  if (!posting) {
    notFound();
  }

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto max-w-5xl">
        <Link
          className="mb-8 inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-primary"
          href="/careers"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Careers
        </Link>

        <div className="flex flex-col gap-3 border-b pb-8">
          <h1 className="max-w-2xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            {posting.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
            {posting.department ? <span>{posting.department}</span> : null}
            {posting.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {posting.location}
              </span>
            ) : null}
            <Badge variant="outline">
              {employmentTypeLabel[posting.employmentType]}
            </Badge>
          </div>
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-2">
          <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line">
            <p>{posting.description}</p>
            {posting.requirements ? (
              <>
                <h2>Requirements</h2>
                <p>{posting.requirements}</p>
              </>
            ) : null}
          </div>

          <ApplyForm jobPostingId={posting.id} />
        </div>
      </div>
    </div>
  );
};

export default JobPostingPage;
