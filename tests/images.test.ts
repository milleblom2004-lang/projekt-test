import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";

vi.mock("server-only", () => ({}));
import { detectImageKind, thumbUrl } from "@/lib/images";
import { processImage } from "@/lib/process-image";

describe("detectImageKind", () => {
  it("detects JPEG, PNG and HEIC by magic bytes", async () => {
    const jpeg = await sharp({ create: { width: 4, height: 4, channels: 3, background: "red" } }).jpeg().toBuffer();
    const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: "red" } }).png().toBuffer();
    expect(detectImageKind(jpeg)).toBe("jpeg");
    expect(detectImageKind(png)).toBe("png");

    const heic = Buffer.alloc(32);
    heic.writeUInt32BE(24, 0);
    heic.write("ftypmif1", 4, "ascii");
    heic.write("mif1heic", 16, "ascii");
    expect(detectImageKind(heic)).toBe("heic");
  });

  it("rejects other files even if renamed", () => {
    expect(detectImageKind(Buffer.from("GIF89a......"))).toBeNull();
    expect(detectImageKind(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    const mp4 = Buffer.alloc(32);
    mp4.writeUInt32BE(24, 0);
    mp4.write("ftypisom", 4, "ascii");
    expect(detectImageKind(mp4)).toBeNull();
  });
});

describe("processImage", () => {
  it("strips EXIF (including GPS) and produces a thumbnail", async () => {
    const withExif = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: "white" } })
      .withExif({
        IFD0: { Make: "TestCam", Model: "X1" },
        IFD3: { GPSLatitudeRef: "N", GPSLatitude: "59/1 19/1 0/1", GPSLongitudeRef: "E", GPSLongitude: "18/1 4/1 0/1" },
      })
      .jpeg()
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();

    const { full, thumb } = await processImage(withExif, "jpeg");
    const fullMeta = await sharp(full).metadata();
    const thumbMeta = await sharp(thumb).metadata();
    expect(fullMeta.exif).toBeUndefined();
    expect(fullMeta.xmp).toBeUndefined();
    expect(thumbMeta.exif).toBeUndefined();
    expect(fullMeta.format).toBe("jpeg");
    expect(Math.max(fullMeta.width!, fullMeta.height!)).toBe(2048);
    expect(thumbMeta.width).toBe(480);
    expect(full.toString("latin1")).not.toContain("TestCam");
  });

  it("rejects corrupt images", async () => {
    const broken = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(100)]);
    await expect(processImage(broken, "jpeg")).rejects.toThrow();
  });
});

describe("thumbUrl", () => {
  it("derives the thumbnail path", () => {
    expect(thumbUrl("https://x.supabase.co/storage/v1/object/public/sightings/u/a.jpg")).toBe(
      "https://x.supabase.co/storage/v1/object/public/sightings/u/a_thumb.jpg",
    );
  });
});
