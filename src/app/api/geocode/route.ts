import { NextResponse, type NextRequest } from "next/server";
import { searchPlaces } from "@/lib/geocode";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isLocale } from "@/i18n/config";

// Address search proxy (keeps Nominatim's usage policy: UA, throttling, caching).
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const langParam = request.nextUrl.searchParams.get("lang");
  const lang = isLocale(langParam) ? langParam : "en";
  if (q.length < 2 || q.length > 200) return NextResponse.json([]);
  if (!rateLimit(`geo:${clientIp(request.headers)}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  try {
    return NextResponse.json(await searchPlaces(q, lang));
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
