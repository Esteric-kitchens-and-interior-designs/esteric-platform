import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("interior-designs");

// Service images/portfolio are edited from the separate CRM deployment,
// which can't trigger a rebuild here — see apps/web/app/(home)/page.tsx.
export const revalidate = 60;

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: service?.title ?? "Interior Designs",
    description:
      service?.description ?? "Bespoke interior design in Nairobi, Kenya.",
  });

const InteriorDesignsPage = () => {
  if (!service) {
    return null;
  }

  return <ServicePageContent service={service} />;
};

export default InteriorDesignsPage;
