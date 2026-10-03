/** Localised country name from an ISO 3166-1 alpha-2 code. */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** "City, Country" in the viewer's language. */
export function placeLabel(s: { place_name: string | null; country: string | null }, locale: string) {
  return [s.place_name, s.country ? countryName(s.country, locale) : null].filter(Boolean).join(", ");
}
