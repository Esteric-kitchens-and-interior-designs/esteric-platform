import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database, type ServiceCategory } from "@repo/database";
import { redirect } from "next/navigation";
import { Header } from "../../components/header";
import { serviceCategoryLabel } from "../../projects/lib/helpers";
import { ImageGalleryManager } from "../components/image-gallery-manager";
import {
  createServiceImage,
  deleteServiceImage,
  type ServiceImagePayload,
  updateServiceImage,
} from "./actions";

const MAX_SERVICE_IMAGES = 4;

const SERVICE_CATEGORIES = [
  "KITCHEN",
  "INTERIOR",
  "LANDSCAPING",
  "WARDROBES_CABINETS",
] as const satisfies readonly ServiceCategory[];

const ServiceImagesPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const canWrite = hasPermission(staffUser, "content:write");
  const allImages = await database.serviceImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <Header page="Service Images" pages={["Content"]} />
      <div className="flex flex-col gap-8 p-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">
            Service Images
          </h1>
          <p className="text-muted-foreground text-sm">
            Each service page's photo gallery — up to {MAX_SERVICE_IMAGES}{" "}
            images per service. Uploads are watermarked automatically.
          </p>
        </div>
        {SERVICE_CATEGORIES.map((category) => {
          const createForCategory = async (
            payload: Omit<ServiceImagePayload, "category">
          ) => {
            "use server";
            await createServiceImage({ ...payload, category });
          };

          return (
            <div className="flex flex-col gap-3" key={category}>
              <h2 className="font-display text-lg tracking-tight">
                {serviceCategoryLabel[category]}
              </h2>
              <ImageGalleryManager
                canWrite={canWrite}
                emptyLabel={`No ${serviceCategoryLabel[category]} images yet.`}
                folder={`services/${category.toLowerCase()}`}
                images={allImages.filter(
                  (image) => image.category === category
                )}
                maxImages={MAX_SERVICE_IMAGES}
                onCreate={createForCategory}
                onDelete={deleteServiceImage}
                onUpdate={updateServiceImage}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ServiceImagesPage;
