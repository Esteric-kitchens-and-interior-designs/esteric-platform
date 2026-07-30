import { MoveRight } from "lucide-react";
import Link from "next/link";
import { services } from "@/lib/services";

export const Services = () => (
  <div className="w-full py-16 lg:py-24">
    <div className="container mx-auto">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
            What we do
          </h2>
          <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
            From first sketch to final install, we handle every detail of your
            kitchen, interior, and outdoor design project.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              className="group flex flex-col justify-between gap-8 rounded-md border bg-card p-6 transition-colors hover:border-primary"
              href={`/${service.slug}`}
              key={service.slug}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <service.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl tracking-tight">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {service.tagline}
                </p>
                <span className="mt-2 flex items-center gap-1 text-primary text-sm opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <MoveRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </div>
);
