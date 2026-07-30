import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("interior-designs");

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
