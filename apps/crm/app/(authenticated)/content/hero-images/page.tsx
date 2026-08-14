import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { Header } from "../../components/header";
import { ImageGalleryManager } from "../components/image-gallery-manager";
import { createHeroImage, deleteHeroImage, updateHeroImage } from "./actions";

const MAX_HERO_IMAGES = 3;

const HeroImagesPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const canWrite = hasPermission(staffUser, "content:write");
  const images = await database.heroImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <Header page="Hero Images" pages={["Content"]} />
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">Hero Images</h1>
          <p className="text-muted-foreground text-sm">
            The homepage slider — up to {MAX_HERO_IMAGES} images. Uploads are
            watermarked automatically.
          </p>
        </div>
        <ImageGalleryManager
          canWrite={canWrite}
          emptyLabel="No hero images yet."
          folder="hero"
          images={images}
          maxImages={MAX_HERO_IMAGES}
          onCreate={createHeroImage}
          onDelete={deleteHeroImage}
          onUpdate={updateHeroImage}
        />
      </div>
    </>
  );
};

export default HeroImagesPage;
