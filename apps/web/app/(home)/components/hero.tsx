import { Button } from "@repo/design-system/components/ui/button";
import { CalendarCheck, HouseIcon, MoveRight } from "lucide-react";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";

export const Hero = () => (
  <div className="w-full">
    <div className="container mx-auto">
      <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary text-xs uppercase tracking-[0.2em]">
            Nairobi · Kenya
          </span>
          <h1 className="max-w-xl text-left font-display font-regular text-5xl tracking-tighter md:text-6xl">
            Bespoke kitchens & interiors, crafted around the way you live
          </h1>
          <p className="max-w-lg text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
            Esteric Kitchens & Interior Designs brings together considered
            design, handcrafted cabinetry, and meticulous project management to
            create kitchens, interiors, and landscapes built to last.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="gap-2" size="lg">
              <Link href="/quote">
                Request a Quote <MoveRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="gap-2" size="lg" variant="outline">
              <Link href="/appointment">
                Book a Consultation <CalendarCheck className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        {/* TODO: replace with a hero photograph of a signature Esteric kitchen or living space */}
        <ImagePlaceholder
          className="aspect-[4/3] w-full"
          icon={HouseIcon}
          label="Signature Project"
          tone="gold"
        />
      </div>
    </div>
  </div>
);
