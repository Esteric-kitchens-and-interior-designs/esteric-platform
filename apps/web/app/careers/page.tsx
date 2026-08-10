import { Badge } from "@repo/design-system/components/ui/badge";
import { createMetadata } from "@repo/seo/metadata";
import { MapPin, MoveRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedJobPostings } from "@/lib/queries";

const employmentTypeLabel: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Careers",
    description:
      "Join the team at Esteric Kitchens & Interior Designs — current openings in Nairobi, Kenya.",
  });

const CareersPage = async () => {
  const postings = await getPublishedJobPostings();

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Careers
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Build your craft with us. Here's what we're hiring for right now.
          </p>
        </div>

        {postings.length > 0 ? (
          <div className="flex flex-col gap-4">
            {postings.map((posting) => (
              <Link
                className="group flex flex-col gap-3 rounded-md border bg-card p-6 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
                href={`/careers/${posting.slug}`}
                key={posting.id}
              >
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-xl tracking-tight transition-colors group-hover:text-primary">
                    {posting.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                    {posting.department ? (
                      <span>{posting.department}</span>
                    ) : null}
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
                <MoveRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            We don't have any open positions right now, but we're always
            interested in hearing from skilled designers and craftspeople. Reach
            out via our{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/contact"
            >
              Contact page
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
};

export default CareersPage;
