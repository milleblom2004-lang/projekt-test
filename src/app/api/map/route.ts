import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export const revalidate = 30;

export interface MapSighting {
  id: string;
  lat: number;
  lng: number;
  image_url: string;
  sighted_at: string;
  description: string | null;
  place_name: string | null;
  country: string | null;
  display_name: string | null;
}

// Public, cacheable list of visible sightings for the map (anon = RLS hides hidden posts).
export async function GET() {
  if (!SUPABASE_URL) return NextResponse.json([]);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("sightings")
    .select("id,latitude,longitude,image_url,sighted_at,description,place_name,country,users(display_name)")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) return NextResponse.json({ error: "failed" }, { status: 500 });

  const rows: MapSighting[] = (data ?? []).map((s) => {
    const u = s.users as unknown as { display_name: string | null } | null;
    return {
      id: s.id,
      lat: s.latitude,
      lng: s.longitude,
      image_url: s.image_url,
      sighted_at: s.sighted_at,
      description: s.description,
      place_name: s.place_name,
      country: s.country,
      display_name: u?.display_name ?? null,
    };
  });
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
  });
}
