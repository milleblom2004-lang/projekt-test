import { describe, expect, it } from "vitest";
import { displayNameSchema, firstErrorKey, newSightingSchema } from "@/lib/validation";
import { negotiateLocale } from "@/i18n/config";
import { safeNext } from "@/lib/safe-next";

const base = {
  latitude: "59.33",
  longitude: "18.06",
  sighted_at: new Date(Date.now() - 60_000).toISOString(),
  description: "  On the subway  ",
  consent: "true",
};

describe("newSightingSchema", () => {
  it("accepts a valid sighting and trims the description", () => {
    const r = newSightingSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.description).toBe("On the subway");
  });

  it.each([
    [{ consent: "false" }, "consent_required"],
    [{ consent: undefined }, "consent_required"],
    [{ latitude: "91" }, "invalid_location"],
    [{ longitude: null }, "invalid_location"],
    [{ latitude: "" }, "invalid_location"],
    [{ sighted_at: "nope" }, "invalid_date"],
    [{ sighted_at: new Date(Date.now() + 3600_000).toISOString() }, "date_in_future"],
    [{ description: "x".repeat(281) }, "description_too_long"],
  ])("rejects %o", (patch, key) => {
    const r = newSightingSchema.safeParse({ ...base, ...patch });
    expect(r.success).toBe(false);
    if (!r.success) expect(firstErrorKey(r.error)).toBe(key);
  });

  it("counts emoji as single characters", () => {
    expect(newSightingSchema.safeParse({ ...base, description: "🎩".repeat(280) }).success).toBe(true);
  });
});

describe("displayNameSchema", () => {
  it("normalises whitespace", () => {
    expect(displayNameSchema.parse("  Hat   Fan ")).toBe("Hat Fan");
  });
  it("rejects e-mail addresses and bad lengths", () => {
    expect(displayNameSchema.safeParse("me@example.com").success).toBe(false);
    expect(displayNameSchema.safeParse("a").success).toBe(false);
    expect(displayNameSchema.safeParse("x".repeat(31)).success).toBe(false);
    expect(displayNameSchema.safeParse("Åsa Öberg").success).toBe(true);
  });
});

describe("negotiateLocale", () => {
  it("picks Swedish for Swedish browsers and falls back to English", () => {
    expect(negotiateLocale("sv-SE,sv;q=0.9,en;q=0.8")).toBe("sv");
    expect(negotiateLocale("de-DE,de;q=0.9")).toBe("en");
    expect(negotiateLocale("de-DE,sv;q=0.5")).toBe("sv");
    expect(negotiateLocale(null)).toBe("en");
  });
});

describe("safeNext", () => {
  it("blocks open redirects", () => {
    expect(safeNext("/new")).toBe("/new");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
  });
});
