import "server-only";

import sharp from "sharp";

// Tuned for a subtle-but-real deterrent: visible enough to survive a crop
// or a re-share, faint enough not to fight for attention with the photo.
const WATERMARK_OPACITY = 0.16;
const TILE_SIZE_RATIO = 0.22;
const MIN_TILE_PX = 90;
const TILE_SPACING_RATIO = 2.6;
const OUTPUT_QUALITY = 88;
const DEFAULT_DIMENSION_PX = 1600;

/**
 * Composites a faded, diagonally repeating watermark across a photo and
 * returns a JPEG buffer. Call this once at upload time — every file that
 * ever lands in Blob storage should already carry the mark, since there is
 * no unwatermarked "original" kept anywhere downstream of this function.
 * A single corner badge would survive a lazy crop; a sparse repeating tile
 * does not.
 */
export const applyWatermark = async (
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

  // Shrink the mark to tile size and dial back its alpha channel uniformly
  // (a 1x1 semi-transparent tile multiplied in via "dest-in").
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

  // Render the repeating pattern as a single SVG layer sized to the source
  // photo, then composite it over the photo in one pass.
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
