import { Button } from "@repo/design-system/components/ui/button";
import { createMetadata } from "@repo/seo/metadata";
import {
  Award,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Users2,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "About Us",
    description:
      "Esteric Kitchens & Interior Designs Ltd — a Nairobi-based design and build studio crafting bespoke kitchens, interiors, and landscapes.",
  });

const values = [
  {
    icon: Compass,
    title: "Design-led",
    description:
      "Every project begins with understanding how you actually live, then designing around that — not a catalogue template.",
  },
  {
    icon: ShieldCheck,
    title: "Built to last",
    description:
      "We use quality materials and proven joinery techniques so what we build holds up for decades.",
  },
  {
    icon: HeartHandshake,
    title: "Honest process",
    description:
      "Transparent pricing, realistic timelines, and clear communication from first consultation to handover.",
  },
  {
    icon: Users2,
    title: "In-house craftsmanship",
    description:
      "Our own workshop and installation team means quality control from design to the final fitting.",
  },
] as const;

const team = [
  {
    name: "Founder & Creative Director",
    role: "Design leadership",
  },
  {
    name: "Head of Joinery",
    role: "Workshop & fabrication",
  },
  {
    name: "Senior Interior Designer",
    role: "Interiors & styling",
  },
  {
    name: "Projects Lead",
    role: "Client delivery",
  },
] as const;

const AboutPage = () => (
  <div className="w-full">
    <div className="container mx-auto flex flex-col gap-20 py-16 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span className="font-medium text-primary text-xs uppercase tracking-[0.2em]">
            Our Story
          </span>
          <h1 className="max-w-xl text-left font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Bringing considered design and real craftsmanship to Kenyan homes
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Esteric Kitchens & Interior Designs Ltd was founded on a simple
            idea: that a home's kitchen and interiors should be designed around
            the people who live in it, and built by craftspeople who take real
            pride in the work. What started as a small cabinetry workshop has
            grown into a full-service design and build studio — covering
            kitchens, interiors, landscaping, and bespoke storage — without
            losing the hands-on, detail-first approach we started with.
          </p>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Today our team of designers, joiners, and project managers works
            with homeowners, developers, and businesses across Nairobi and
            beyond, delivering projects from single-room refreshes to full-home
            renovations.
          </p>
        </div>
        {/* TODO: replace with a photograph of the founder, workshop, or team on site */}
        <ImagePlaceholder
          className="aspect-[4/3] w-full"
          icon={Award}
          label="Our Workshop"
          tone="emerald"
        />
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl font-display font-regular text-3xl tracking-tighter md:text-4xl">
            What we stand for
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            The principles that guide every project, big or small.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              className="flex flex-col gap-3 rounded-md border bg-card p-6"
              key={value.title}
            >
              <value.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h3 className="font-display text-lg tracking-tight">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl font-display font-regular text-3xl tracking-tighter md:text-4xl">
            Meet the team
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            The people behind every design, drawing, and finished project.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div className="flex flex-col gap-4" key={member.name}>
              {/* TODO: replace with a real headshot of this team member */}
              <ImagePlaceholder
                className="aspect-square w-full"
                icon={Users2}
                tone="gold"
              />
              <div className="flex flex-col">
                <p className="font-display text-lg tracking-tight">
                  {member.name}
                </p>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-md bg-secondary p-10 text-center text-secondary-foreground lg:p-16">
        <h2 className="max-w-xl font-display font-regular text-3xl tracking-tighter md:text-4xl">
          Want to work with us?
        </h2>
        <p className="max-w-xl text-secondary-foreground/75 leading-relaxed">
          Tell us about your project and we'll be in touch within one business
          day.
        </p>
        <Button asChild size="lg">
          <Link href="/quote">Request a Quote</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default AboutPage;
