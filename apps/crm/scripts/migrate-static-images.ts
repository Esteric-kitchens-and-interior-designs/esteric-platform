import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
// Standalone script (run via tsx, not Next.js) — constructs its own Prisma
// client and inlines the watermark compositing logic rather than importing
// @repo/database's index or @repo/storage/watermark, both of which are
// guarded with "server-only" and throw outside a Next.js server context.
import { PrismaClient } from "@repo/database/generated/client";
import { put } from "@repo/storage";
import sharp from "sharp";

// One-time migration: the hero slider and service-page galleries used to be
// static files checked into apps/web/public/images, read via a hardcoded
// array. They're now CRM-managed (HeroImage / ServiceImage tables, images
// stored in Blob). This script uploads the existing photos through the same
// watermarking treatment as a normal CRM upload and seeds the corresponding
// rows, so nothing visually changes for a site visitor — the images just
// become staff-editable and protected going forward. Safe to re-run: it
// skips categories/slots that already have rows.
//
// Run from apps/crm: pnpm migrate:static-images

const database = new PrismaClient({
  adapter: new PrismaNeonHttp(process.env.DATABASE_URL ?? "", {}),
});

const WEB_IMAGES_DIR = path.join(
  import.meta.dirname,
  "../../web/public/images"
);

// --- watermark compositing (mirrors packages/storage/watermark.ts) ---

const WATERMARK_OPACITY = 0.16;
const TILE_SIZE_RATIO = 0.22;
const MIN_TILE_PX = 90;
const TILE_SPACING_RATIO = 2.6;
const OUTPUT_QUALITY = 88;
const DEFAULT_DIMENSION_PX = 1600;

const applyWatermark = async (
  imageBuffer: Buffer,
  watermarkBuffer: Buffer
): Promise<Buffer> => {
  const source = sharp(imageBuffer).rotate();
  const metadata = await source.metadata();
  const width = metadata.width ?? DEFAULT_DIMENSION_PX;
  const height = metadata.height ?? DEFAULT_DIMENSION_PX;

  const tileSize = Math.max(
    MIN_TILE_PX,
    Math.round(Math.min(width, height) * TILE_SIZE_RATIO)
  );
  const spacing = Math.round(tileSize * TILE_SPACING_RATIO);

  const fadedMark = await sharp(watermarkBuffer)
    .resize(tileSize, tileSize, { fit: "inside" })
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([
          255,
          255,
          255,
          Math.round(255 * WATERMARK_OPACITY),
        ]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const pattern = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          height="${spacing}"
          id="wm"
          patternTransform="rotate(-30)"
          patternUnits="userSpaceOnUse"
          width="${spacing}"
        >
          <image
            height="${tileSize}"
            href="data:image/png;base64,${fadedMark.toString("base64")}"
            width="${tileSize}"
            x="${spacing / 4}"
            y="${spacing / 4}"
          />
        </pattern>
      </defs>
      <rect fill="url(#wm)" height="100%" width="100%" />
    </svg>
  `;

  return await source
    .composite([{ input: Buffer.from(pattern), left: 0, top: 0 }])
    .jpeg({ quality: OUTPUT_QUALITY })
    .toBuffer();
};

// --- source data ---

const HERO_IMAGES: { altText: string; file: string }[] = [
  {
    file: "hero/hero-kitchen-navy.jpg",
    altText:
      "Custom navy-blue kitchen with brass pendant lighting and marble island",
  },
  {
    file: "hero/hero-living-room.jpg",
    altText: "Living room with tailored drapery and natural light",
  },
  {
    file: "hero/hero-kitchen-dark-marble.jpg",
    altText: "Kitchen with dark marble countertops overlooking the garden",
  },
];

const SERVICE_IMAGES: {
  altText: string;
  category: "KITCHEN" | "INTERIOR" | "LANDSCAPING" | "WARDROBES_CABINETS";
  file: string;
}[] = [
  {
    category: "KITCHEN",
    file: "kitchen-designs/kitchen-navy-island.jpg",
    altText:
      "Navy-blue kitchen with brass pendant lighting and a marble island",
  },
  {
    category: "KITCHEN",
    file: "kitchen-designs/kitchen-dark-marble-view.jpg",
    altText: "Kitchen with dark marble countertops and a garden view",
  },
  {
    category: "KITCHEN",
    file: "kitchen-designs/kitchen-dark-counters.jpg",
    altText: "Kitchen with built-in double ovens and dark countertops",
  },
  {
    category: "KITCHEN",
    file: "kitchen-designs/kitchen-window-view.jpg",
    altText: "Kitchen island with pendant lighting overlooking large windows",
  },
  {
    category: "INTERIOR",
    file: "interior-designs/living-room-drapery.jpg",
    altText: "Living room with tailored drapery and sheer curtains",
  },
  {
    category: "INTERIOR",
    file: "interior-designs/living-room-windows.jpg",
    altText: "Living room seating arranged before floor-to-ceiling windows",
  },
  {
    category: "INTERIOR",
    file: "interior-designs/staircase-mirror.jpg",
    altText: "Entryway with an octagonal mirror and hardwood staircase",
  },
  {
    category: "INTERIOR",
    file: "interior-designs/grand-staircase.jpg",
    altText: "Grand staircase with wrought-iron balustrade",
  },
  {
    category: "WARDROBES_CABINETS",
    file: "wardrobes-cabinets/pantry-pullout-1.jpg",
    altText: "Fitted pull-out pantry cabinetry mid-installation",
  },
  {
    category: "WARDROBES_CABINETS",
    file: "wardrobes-cabinets/pantry-pullout-2.jpg",
    altText: "Tall pull-out storage unit with wire shelving",
  },
  {
    category: "WARDROBES_CABINETS",
    file: "wardrobes-cabinets/cabinet-detail.jpg",
    altText: "Detail of fitted overhead cabinetry finish",
  },
];

const uploadWatermarked = async (
  relativeFilePath: string,
  folder: string,
  watermarkBuffer: Buffer
) => {
  const original = await readFile(path.join(WEB_IMAGES_DIR, relativeFilePath));
  const watermarked = await applyWatermark(original, watermarkBuffer);
  const baseName = path.basename(
    relativeFilePath,
    path.extname(relativeFilePath)
  );
  const blob = await put(
    `${folder}/${Date.now()}-${baseName}.jpg`,
    watermarked,
    {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    }
  );
  return blob.url;
};

const main = async () => {
  const watermarkBuffer = await readFile(
    path.join(WEB_IMAGES_DIR, "logo/esteric-mark.png")
  );

  const existingHeroCount = await database.heroImage.count();
  if (existingHeroCount > 0) {
    console.log(`Skipping hero images — ${existingHeroCount} already exist.`);
  } else {
    for (const [index, { file, altText }] of HERO_IMAGES.entries()) {
      const url = await uploadWatermarked(file, "hero", watermarkBuffer);
      await database.heroImage.create({
        data: { url, altText, sortOrder: index },
      });
      console.log(`Migrated hero image: ${file}`);
    }
  }

  for (const category of [
    "KITCHEN",
    "INTERIOR",
    "LANDSCAPING",
    "WARDROBES_CABINETS",
  ] as const) {
    const existingCount = await database.serviceImage.count({
      where: { category },
    });
    if (existingCount > 0) {
      console.log(
        `Skipping ${category} images — ${existingCount} already exist.`
      );
      continue;
    }

    const imagesForCategory = SERVICE_IMAGES.filter(
      (image) => image.category === category
    );
    for (const [index, { file, altText }] of imagesForCategory.entries()) {
      const url = await uploadWatermarked(
        file,
        `services/${category.toLowerCase()}`,
        watermarkBuffer
      );
      await database.serviceImage.create({
        data: { category, url, altText, sortOrder: index },
      });
      console.log(`Migrated ${category} image: ${file}`);
    }
  }

  console.log("Done.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
