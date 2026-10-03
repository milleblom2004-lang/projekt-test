import "server-only";

// OpenStreetMap Nominatim. Usage policy: max 1 request/second, identify the
// app with a User-Agent, cache results. https://operations.osmfoundation.org/policies/nominatim/
const BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = process.env.NOMINATIM_USER_AGENT || "HatSpotted/0.1 (fan project)";

let queue: Promise<unknown> = Promise.resolve();
let last = 0;

function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = Math.max(0, last + 1100 - Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    return fn();
  });
  queue = run.catch(() => undefined);
  return run;
}

const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 24 * 60 * 60 * 1000;

async function fetchJson<T>(path: string, lang: string): Promise<T> {
  const key = `${lang}|${path}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await throttled(async () => {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": lang },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    return (await res.json()) as T;
  });
  if (cache.size > 5000) cache.clear();
  cache.set(key, { at: Date.now(), value });
  return value;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  suburb?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

export interface Place {
  place_name: string | null;
  country: string | null; // ISO 3166-1 alpha-2, upper case
}

export function placeFromAddress(address: NominatimAddress | undefined): Place {
  if (!address) return { place_name: null, country: null };
  const place =
    address.city ?? address.town ?? address.village ?? address.hamlet ??
    address.municipality ?? address.suburb ?? address.county ?? address.state ?? null;
  const cc = address.country_code?.toUpperCase();
  return {
    place_name: place ? place.slice(0, 200) : null,
    country: cc && /^[A-Z]{2}$/.test(cc) ? cc : null,
  };
}

/** City + country for a coordinate. Place names are stored in English. */
export async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  try {
    const data = await fetchJson<{ address?: NominatimAddress }>(
      `/reverse?format=jsonv2&zoom=12&addressdetails=1&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}`,
      "en",
    );
    return placeFromAddress(data.address);
  } catch {
    return { place_name: null, country: null };
  }
}

export interface SearchResult {
  label: string;
  latitude: number;
  longitude: number;
}

export async function searchPlaces(q: string, lang: string): Promise<SearchResult[]> {
  const data = await fetchJson<Array<{ display_name: string; lat: string; lon: string }>>(
    `/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`,
    lang,
  );
  return data.map((r) => ({
    label: r.display_name,
    latitude: Number(r.lat),
    longitude: Number(r.lon),
  }));
}
