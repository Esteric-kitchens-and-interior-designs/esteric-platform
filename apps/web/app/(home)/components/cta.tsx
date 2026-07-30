import { Button } from "@repo/design-system/components/ui/button";
import { CalendarCheck, MoveRight } from "lucide-react";
import Link from "next/link";

export const CTA = () => (
  <div className="w-full py-16 lg:py-24">
    <div className="container mx-auto">
      <div className="flex flex-col items-center gap-8 rounded-md bg-secondary p-10 text-center text-secondary-foreground lg:p-16">
        <div className="flex flex-col gap-2">
          <h3 className="max-w-xl font-display font-regular text-3xl tracking-tighter md:text-5xl">
            Ready to start your project?
          </h3>
          <p className="max-w-xl text-lg text-secondary-foreground/75 leading-relaxed tracking-tight">
            Tell us about your space and budget, or book a consultation with our
            design team — either way, we'll get back to you within one business
            day.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2" size="lg">
            <Link href="/quote">
              Request a Quote <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            className="gap-2 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
            size="lg"
            variant="outline"
          >
            <Link href="/appointment">
              Book a Consultation <CalendarCheck className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
);
