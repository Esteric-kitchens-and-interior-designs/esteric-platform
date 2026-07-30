import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { getServiceBySlug } from "@/lib/services";

const service = getServiceBySlug("wardrobes-cabinets");

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: service?.title ?? "Wardrobes & Cabinets",
    description:
      service?.description ??
      "Bespoke wardrobes and cabinetry in Nairobi, Kenya.",
  });

const WardrobesCabinetsPage = () => {
  if (!service) {
    return null;
  }

  return <ServicePageContent service={service} />;
};

export default WardrobesCabinetsPage;
