import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("kitchen-designs");

// Service images/portfolio are edited from the separate CRM deployment,
// which can't trigger a rebuild here — see apps/web/app/(home)/page.tsx.
export const revalidate = 60;

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: service?.title ?? "Kitchen Designs",
    description:
      service?.description ?? "Bespoke kitchen design in Nairobi, Kenya.",
  });

const KitchenDesignsPage = () => {
  if (!service) {
    return null;
  }

  return <ServicePageContent service={service} />;
};

export default KitchenDesignsPage;
