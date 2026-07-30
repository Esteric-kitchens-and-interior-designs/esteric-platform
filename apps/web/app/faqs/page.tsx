import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { getAllFaqs } from "@/lib/queries";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "FAQs",
    description:
      "Frequently asked questions about working with Esteric Kitchens & Interior Designs.",
  });

const UNCATEGORIZED = "General";

const FaqsPage = async () => {
  const faqs = await getAllFaqs();
  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const category = faq.category ?? UNCATEGORIZED;
    acc[category] = [...(acc[category] ?? []), faq];
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Answers to what clients ask us most. Can't find what you need?{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="/contact"
            >
              Get in touch
            </a>
            .
          </p>
        </div>

        {categories.length > 0 ? (
          categories.map((category) => (
            <div className="flex flex-col gap-4" key={category}>
              <h2 className="font-display text-2xl tracking-tight md:text-3xl">
                {category}
              </h2>
              <Accordion collapsible type="single">
                {grouped[category]?.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            FAQs will be published here soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default FaqsPage;
