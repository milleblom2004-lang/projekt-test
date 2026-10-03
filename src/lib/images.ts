// File type detection by magic bytes - never trust the client's MIME type.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type ImageKind = "jpeg" | "png" | "heic";

const HEIC_BRANDS = new Set(["heic", "heix", "heim", "heis", "hevc", "hevx", "mif1", "msf1"]);

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "png";
  }
  // ISO-BMFF: [size:4]["ftyp"][major brand:4][minor:4][compatible brands...]
  if (bytes.length >= 16 && ascii(bytes, 4, 8) === "ftyp") {
    const boxSize = Math.min(
      ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0,
      bytes.length,
      64,
    );
    const brands = [ascii(bytes, 8, 12)];
    for (let i = 16; i + 4 <= boxSize; i += 4) brands.push(ascii(bytes, i, i + 4));
    if (brands.some((b) => HEIC_BRANDS.has(b))) return "heic";
  }
  return null;
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

/** Derive the thumbnail URL from a stored image URL (see processImage). */
export function thumbUrl(imageUrl: string) {
  return imageUrl.replace(/\.jpg(\?.*)?$/, "_thumb.jpg$1");
}
