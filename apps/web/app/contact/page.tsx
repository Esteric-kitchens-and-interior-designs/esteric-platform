import { createMetadata } from "@repo/seo/metadata";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "./components/contact-form";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Contact Us",
    description:
      "Get in touch with Esteric Kitchens & Interior Designs to start your kitchen, interior, or landscaping project.",
  });

const ContactPage = () => (
  <div className="w-full py-16 lg:py-24">
    <div className="container mx-auto max-w-6xl">
      <div className="mb-14 flex flex-col gap-2">
        <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
          Get in Touch
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
          Tell us about your project and we'll get back to you within one
          business day.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Studio & Showroom</p>
                <p className="text-muted-foreground text-sm">
                  {siteConfig.address.full}{" "}
                  <span className="opacity-60">
                    (TODO: confirm real address)
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <a
                  className="text-muted-foreground text-sm hover:underline"
                  href={siteConfig.phoneHref}
                >
                  {siteConfig.phone}
                </a>{" "}
                <span className="text-muted-foreground text-xs opacity-60">
                  (TODO: real number)
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <a
                  className="text-muted-foreground text-sm hover:underline"
                  href={`mailto:${siteConfig.email}`}
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="flex flex-col">
                <p className="font-medium">Hours</p>
                {siteConfig.hours.map((entry) => (
                  <p className="text-muted-foreground text-sm" key={entry.days}>
                    {entry.days}: {entry.hours}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* TODO: swap for the real showroom location once confirmed */}
          <div className="aspect-video w-full overflow-hidden rounded-md border">
            <iframe
              allowFullScreen
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={siteConfig.googleMapsEmbedSrc}
              title="Esteric Kitchens & Interior Designs location (placeholder — to be updated)"
            />
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  </div>
);

export default ContactPage;
