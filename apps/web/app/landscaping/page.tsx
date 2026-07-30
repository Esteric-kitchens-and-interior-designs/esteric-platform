import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("landscaping");

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: service?.title ?? "Landscaping",
    description:
      service?.description ?? "Landscape design and build in Nairobi, Kenya.",
  });

const LandscapingPage = () => {
  if (!service) {
    return null;
  }

  return <ServicePageContent service={service} />;
};

export default LandscapingPage;
