import { format } from "date-fns";
import { Award, BadgeCheck } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import type { getPublishedCertifications } from "@/lib/queries";

interface CertificationsProps {
  readonly items: Awaited<ReturnType<typeof getPublishedCertifications>>;
}

export const Certifications = ({ items }: CertificationsProps) => {
  if (items.length === 0) {
    return null;
  }

  const certifications = items.filter((item) => item.type === "CERTIFICATION");
  const awards = items.filter((item) => item.type === "AWARD");

  const groups = [
    { title: "Certifications", icon: BadgeCheck, items: certifications },
    { title: "Awards", icon: Award, items: awards },
  ] as const;

  return (
    <div className="w-full scroll-mt-20 py-16 lg:py-24" id="certifications">
      <div className="container mx-auto flex flex-col gap-14">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
            Certifications & Awards
          </h2>
          <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
            Recognition and credentials that reflect our commitment to quality
            and professional standards.
          </p>
        </div>

        {groups.map((group) =>
          group.items.length > 0 ? (
            <div className="flex flex-col gap-6" key={group.title}>
              <h3 className="font-display text-xl tracking-tight md:text-2xl">
                {group.title}
              </h3>
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
      </div>
    </div>
  );
};
