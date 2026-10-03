import "server-only";
import sharp from "sharp";
import type { ImageKind } from "./images";

export interface ProcessedImage {
  full: Buffer;
  thumb: Buffer;
}

/**
 * Re-encode an uploaded image as JPEG. sharp drops all metadata (EXIF, GPS,
 * XMP, ICC comments) unless explicitly asked to keep it, and .rotate() bakes
 * the EXIF orientation into the pixels before it is discarded.
 */
export async function processImage(input: Buffer, kind: ImageKind): Promise<ProcessedImage> {
  let source = input;
  if (kind === "heic") {
    const { default: convert } = await import("heic-convert");
    source = Buffer.from(await convert({ buffer: input, format: "JPEG", quality: 0.92 }));
  }

  const base = sharp(source, { failOn: "error", limitInputPixels: 80_000_000 }).rotate();

  const [full, thumb] = await Promise.all([
    base
      .clone()
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer(),
    base
      .clone()
      .resize(480, 480, { fit: "cover", position: "attention" })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer(),
  ]);
  return { full, thumb };
}
