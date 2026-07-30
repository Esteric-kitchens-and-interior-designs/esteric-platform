import { Award, HeartHandshake, Ruler, Users } from "lucide-react";

const pillars = [
  {
    icon: Ruler,
    title: "Bespoke by design",
    description:
      "Every project starts from a blank page — no catalogue layouts, no repeated designs. Just your space, your brief.",
  },
  {
    icon: HeartHandshake,
    title: "One team, start to finish",
    description:
      "Design, fabrication, and installation are handled in-house, with a single project manager as your point of contact.",
  },
  {
    icon: Award,
    title: "Craftsmanship you can see",
    description:
      "Our workshop team hand-finishes every piece of cabinetry to a standard that's built to last for decades, not years.",
  },
  {
    icon: Users,
    title: "Trusted by homeowners & developers",
    description:
      "From single-room refreshes to full residential developments, we've delivered projects across Nairobi and beyond.",
  },
] as const;

const statsItems = [
  { value: "250+", label: "Projects completed" },
  { value: "15", label: "Years of experience" },
  { value: "98%", label: "Client satisfaction" },
  { value: "40+", label: "Skilled craftspeople" },
] as const;

export const WhyEsteric = () => (
  <div className="w-full bg-muted/40 py-16 lg:py-24">
    <div className="container mx-auto flex flex-col gap-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
            Why homeowners choose Esteric
          </h2>
          <p className="max-w-lg text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
            We combine considered design with genuine craftsmanship — the result
            is a space that's beautiful, functional, and built properly.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:items-center">
          {statsItems.map((stat) => (
            <div className="flex flex-col gap-1" key={stat.label}>
              <span className="font-display text-3xl tracking-tighter md:text-4xl">
                {stat.value}
              </span>
              <span className="text-muted-foreground text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => (
          <div
            className="flex flex-col gap-3 rounded-md border bg-card p-6"
            key={pillar.title}
          >
            <pillar.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <h3 className="font-display text-lg tracking-tight">
              {pillar.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
