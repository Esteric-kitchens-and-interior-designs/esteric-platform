import { ServiceCategory } from "@repo/database/generated/enums";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { AppointmentForm } from "./components/appointment-form";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Book an Appointment",
    description:
      "Book a design consultation with Esteric Kitchens & Interior Designs.",
  });

interface AppointmentPageProps {
  readonly searchParams: Promise<{ service?: string }>;
}

const AppointmentPage = async ({ searchParams }: AppointmentPageProps) => {
  const { service } = await searchParams;
  const defaultService = Object.values(ServiceCategory).includes(
    service as ServiceCategory
  )
    ? (service as ServiceCategory)
    : undefined;

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Book a Consultation
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Choose a date and time that works for you, and our team will confirm
            your appointment.
          </p>
        </div>
        <AppointmentForm defaultService={defaultService} />
      </div>
    </div>
  );
};

export default AppointmentPage;
