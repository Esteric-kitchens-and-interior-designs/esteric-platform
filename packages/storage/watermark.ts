import "server-only";

import { rotation as exifRotation } from "exifr";
import { Jimp } from "jimp";

// Tuned for a subtle-but-real deterrent: visible enough to survive a crop
// or a re-share, faint enough not to fight for attention with the photo.
const WATERMARK_OPACITY = 0.16;
const TILE_SIZE_RATIO = 0.22;
const MIN_TILE_PX = 90;
const TILE_SPACING_RATIO = 2.6;
const OUTPUT_QUALITY = 88;
const DEFAULT_DIMENSION_PX = 1600;
const WATERMARK_ROTATION_DEG = -30;

/**
 * Composites a faded, diagonally repeating watermark across a photo and
 * returns a JPEG buffer. Call this once at upload time — every file that
 * ever lands in Blob storage should already carry the mark, since there is
 * no unwatermarked "original" kept anywhere downstream of this function.
 * A single corner badge would survive a lazy crop; a sparse repeating tile
 * does not.
 *
 * Pure-JS (Jimp) rather than sharp deliberately — sharp's native binary
 * repeatedly failed to load in this project's Vercel + pnpm + Turbopack
 * monorepo setup (missing at runtime despite installing correctly, and
 * forcing it in via outputFileTracingIncludes broke Vercel's own deploy
 * packaging outright). Jimp has no native binary, so none of that applies.
 */
export const applyWatermark = async (
  imageBuffer: Buffer,
  watermarkBuffer: Buffer
): Promise<Buffer> => {
  const [source, mark, rotation] = await Promise.all([
    Jimp.fromBuffer(imageBuffer),
    Jimp.fromBuffer(watermarkBuffer),
    // Jimp doesn't read EXIF orientation itself — without this, photos
    // taken on a phone held in portrait would come out sideways, since the
    // stored pixel data is landscape with a rotation tag telling viewers
    // how to display it.
    exifRotation(imageBuffer).catch(() => undefined),
  ]);

  if (rotation) {
    if (rotation.scaleX === -1) {
      source.flip({ horizontal: true, vertical: false });
    }
    if (rotation.scaleY === -1) {
      source.flip({ horizontal: false, vertical: true });
    }
    if (rotation.deg) {
      // exifr's deg is clockwise; Jimp's rotate() is counter-clockwise.
      source.rotate(-rotation.deg);
    }
  }

  const width = source.width || DEFAULT_DIMENSION_PX;
  const height = source.height || DEFAULT_DIMENSION_PX;

  const tileSize = Math.max(
    MIN_TILE_PX,
    Math.round(Math.min(width, height) * TILE_SIZE_RATIO)
  );
  const spacing = Math.round(tileSize * TILE_SPACING_RATIO);

  // Shrink the mark to tile size, dial back its alpha channel uniformly,
  // and pre-rotate it once — every tile placement below reuses this same
  // faded, angled bitmap.
  mark
    .scaleToFit({ w: tileSize, h: tileSize })
    .opacity(WATERMARK_OPACITY)
    .rotate(WATERMARK_ROTATION_DEG);

  for (let y = -spacing; y < height + spacing; y += spacing) {
    for (let x = -spacing; x < width + spacing; x += spacing) {
      source.composite(mark, x, y);
    }
  }

  return await source.getBuffer("image/jpeg", { quality: OUTPUT_QUALITY });
};
