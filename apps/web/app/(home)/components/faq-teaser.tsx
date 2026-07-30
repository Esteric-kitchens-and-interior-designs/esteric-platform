import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/design-system/components/ui/accordion";
import { Button } from "@repo/design-system/components/ui/button";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import type { getFaqTeaser } from "@/lib/queries";

interface FaqTeaserProps {
  readonly faqs: Awaited<ReturnType<typeof getFaqTeaser>>;
}

export const FaqTeaser = ({ faqs }: FaqTeaserProps) => {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
                Frequently asked questions
              </h2>
              <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight lg:max-w-lg">
                Answers to the questions we hear most often from clients.
              </p>
            </div>
            <Button asChild className="w-fit gap-2" variant="outline">
              <Link href="/faqs">
                View all FAQs <MoveRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Accordion className="w-full" collapsible type="single">
            {faqs.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
