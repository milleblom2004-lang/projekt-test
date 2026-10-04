import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";
import type { EmailOtpType } from "@supabase/supabase-js";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";

// Handles OAuth (?code=) and e-mail links for sign-up confirmation and password
// reset (?code= or ?token_hash=&type=).
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  if (!ok) return NextResponse.redirect(new URL("/login?error=1", url.origin));

  const { data } = await supabase.rpc("get_my_profile").maybeSingle<{ id: string; display_name: string | null }>();
  // Remember the language the visitor was using when they signed in.
  const locale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (data && isLocale(locale)) await supabase.from("users").update({ language: locale }).eq("id", data.id);

  const target = data?.display_name ? next : `/onboarding?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(target, url.origin));
}
