import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { placeFromAddress } from "@/lib/geocode";
import { placeLabel } from "@/lib/place";

describe("placeFromAddress", () => {
  it("picks the most specific locality and an ISO country code", () => {
    expect(placeFromAddress({ city: "Stockholm", country_code: "se" })).toEqual({ place_name: "Stockholm", country: "SE" });
    expect(placeFromAddress({ village: "Byn", county: "Län", country_code: "no" })).toEqual({ place_name: "Byn", country: "NO" });
    expect(placeFromAddress(undefined)).toEqual({ place_name: null, country: null });
  });
});

describe("placeLabel", () => {
  it("localises the country name", () => {
    expect(placeLabel({ place_name: "Stockholm", country: "SE" }, "en")).toBe("Stockholm, Sweden");
    expect(placeLabel({ place_name: "Berlin", country: "DE" }, "sv")).toBe("Berlin, Tyskland");
  });
});
