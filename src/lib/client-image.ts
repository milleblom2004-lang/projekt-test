// Browser-side pre-processing: re-encode to JPEG via canvas, which shrinks the
// upload and drops all EXIF/GPS metadata before the file leaves the device.
// The server validates and re-processes everything again regardless.

const MAX_EDGE = 2048;

export interface PreparedImage {
  file: File;
  previewUrl: string | null; // null when the browser can't decode (e.g. HEIC on Chrome)
}

export async function prepareImage(original: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(original, { imageOrientation: "from-image" });
  } catch {
    // Not decodable here (HEIC on most non-Safari browsers): send as-is.
    return { file: original, previewUrl: null };
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { file: original, previewUrl: URL.createObjectURL(original) };
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
  if (!blob) return { file: original, previewUrl: null };
  const file = new File([blob], "sighting.jpg", { type: "image/jpeg" });
  return { file, previewUrl: URL.createObjectURL(file) };
}

/** Value for <input type="datetime-local"> in the device's time zone. */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
