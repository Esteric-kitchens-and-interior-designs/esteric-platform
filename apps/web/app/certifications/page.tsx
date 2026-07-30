import { createMetadata } from "@repo/seo/metadata";
import { format } from "date-fns";
import { Award, BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { getPublishedCertifications } from "@/lib/queries";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Certifications & Awards",
    description:
      "Certifications and industry awards earned by Esteric Kitchens & Interior Designs.",
  });

const CertificationsPage = async () => {
  const items = await getPublishedCertifications();
  const certifications = items.filter((item) => item.type === "CERTIFICATION");
  const awards = items.filter((item) => item.type === "AWARD");

  const groups = [
    { title: "Certifications", icon: BadgeCheck, items: certifications },
    { title: "Awards", icon: Award, items: awards },
  ] as const;

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Certifications & Awards
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Recognition and credentials that reflect our commitment to quality
            and professional standards.
          </p>
        </div>

        {groups.map((group) =>
          group.items.length > 0 ? (
            <div className="flex flex-col gap-6" key={group.title}>
              <h2 className="font-display text-2xl tracking-tight md:text-3xl">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <div
                    className="flex flex-col gap-4 rounded-md border bg-card p-6"
                    key={item.id}
                  >
                    {/* TODO: replace with the real certification/award image or logo */}
                    <ImagePlaceholder
                      className="aspect-video w-full"
                      icon={group.icon}
                      tone="charcoal"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="font-display text-lg tracking-tight">
                        {item.title}
                      </p>
                      {item.issuer ? (
                        <p className="text-muted-foreground text-sm">
                          {item.issuer}
                        </p>
                      ) : null}
                      {item.dateAwarded ? (
                        <p className="text-muted-foreground text-xs">
                          {format(item.dateAwarded, "MMMM yyyy")}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-2 text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}

        {certifications.length === 0 && awards.length === 0 ? (
          <p className="text-muted-foreground">
            Certifications and awards will be published here soon.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default CertificationsPage;
