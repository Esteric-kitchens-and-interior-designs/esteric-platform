import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import Link from "next/link";
import type { getAllFaqs } from "@/lib/queries";

interface FaqsProps {
  readonly faqs: Awaited<ReturnType<typeof getAllFaqs>>;
}

const UNCATEGORIZED = "General";

export const Faqs = ({ faqs }: FaqsProps) => {
  if (faqs.length === 0) {
    return null;
  }

  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const category = faq.category ?? UNCATEGORIZED;
    acc[category] = [...(acc[category] ?? []), faq];
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div className="w-full scroll-mt-20 bg-muted/40 py-16 lg:py-24" id="faqs">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
            Answers to what clients ask us most. Can't find what you need?{" "}
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/contact"
            >
              Get in touch
            </Link>
            .
          </p>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          {categories.map((category) => (
            <div className="flex flex-col gap-4" key={category}>
              <h3 className="font-display text-xl tracking-tight">
                {category}
              </h3>
              <Accordion collapsible type="single">
                {grouped[category]?.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
