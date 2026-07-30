import { Status } from "@repo/observability/status";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Phone as PhoneIcon,
} from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { services } from "@/lib/services";
import { siteConfig } from "@/lib/site-config";

const footerColumns = [
  {
    title: "Services",
    links: services.map((service) => ({
      title: service.shortTitle,
      href: `/${service.slug}`,
    })),
  },
  {
    title: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Portfolio", href: "/portfolio" },
      { title: "Testimonials", href: "/testimonials" },
      { title: "Certifications & Awards", href: "/certifications" },
      { title: "Blog", href: "/blog" },
      { title: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { title: "Request a Quote", href: "/quote" },
      { title: "Book an Appointment", href: "/appointment" },
      { title: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { title: "Privacy Policy", href: "/legal/privacy" },
      { title: "Terms & Conditions", href: "/legal/terms" },
      { title: "Cookie Policy", href: "/legal/cookies" },
      { title: "Accessibility", href: "/legal/accessibility" },
    ],
  },
];

// TODO: replace with real social profile URLs before launch.
const socialLinks = [
  { title: "Instagram", href: siteConfig.social.instagram, icon: Instagram },
  { title: "Facebook", href: siteConfig.social.facebook, icon: Facebook },
  { title: "LinkedIn", href: siteConfig.social.linkedin, icon: Linkedin },
];

export const Footer = () => (
  <section className="dark border-foreground/10 border-t">
    <div className="w-full bg-background py-16 text-foreground lg:py-24">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-4xl">
                {siteConfig.name}
              </h2>
              <p className="max-w-lg text-left text-foreground/75 leading-relaxed tracking-tight">
                {siteConfig.tagline}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-foreground/75 text-sm">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                {siteConfig.address.full}
                <span className="text-xs opacity-60">
                  (TODO: confirm address)
                </span>
              </span>
              <span className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-primary" />
                <a className="hover:underline" href={siteConfig.phoneHref}>
                  {siteConfig.phone}
                </a>
                <span className="text-xs opacity-60">(TODO: real number)</span>
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-foreground/75 text-sm">
                Subscribe for design inspiration and project updates.
              </p>
              <NewsletterForm />
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  aria-label={social.title}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/75 transition-colors hover:border-primary hover:text-primary"
                  href={social.href}
                  key={social.title}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Status />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div
                className="flex flex-col items-start gap-3 text-sm"
                key={column.title}
              >
                <p className="font-display text-base">{column.title}</p>
                <div className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <Link
                      className="text-foreground/75 transition-colors hover:text-primary"
                      href={link.href}
                      key={link.href}
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-foreground/10 border-t pt-6 text-foreground/60 text-xs sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights
            reserved.
          </p>
          <p>Nairobi, Kenya</p>
        </div>
      </div>
    </div>
  </section>
);
