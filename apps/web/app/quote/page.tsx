import { ServiceCategory } from "@repo/database/generated/enums";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { QuoteForm } from "./components/quote-form";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Request a Quote",
    description:
      "Request a bespoke quote for your kitchen, interior, landscaping, or cabinetry project.",
  });

interface QuotePageProps {
  readonly searchParams: Promise<{ service?: string }>;
}

const QuotePage = async ({ searchParams }: QuotePageProps) => {
  const { service } = await searchParams;
  const defaultService = Object.values(ServiceCategory).includes(
    service as ServiceCategory
  )
    ? (service as ServiceCategory)
    : undefined;

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Request a Quote
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Share a few details about your project and our design team will
            follow up with next steps.
          </p>
        </div>
        <QuoteForm defaultService={defaultService} />
      </div>
    </div>
  );
};

export default QuotePage;
