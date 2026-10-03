import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_SIGHTING_COLUMNS, type Sighting } from "@/lib/types";
import { SightingCard } from "@/components/SightingCard";
import { DisplayNameForm } from "@/components/DisplayNameForm";
import { DeleteSightingButton } from "@/components/DeleteSightingButton";
import { DeleteAccount } from "@/components/DeleteAccount";
import { signOut } from "@/app/actions/account";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("me");
  return { title: t("title"), robots: { index: false } };
}

export default async function MyPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/me");
  if (!profile.display_name) redirect("/onboarding?next=/me");

  const t = await getTranslations("me");
  const supabase = await createClient();
  const { data } = await supabase
    .from("sightings")
    .select(PUBLIC_SIGHTING_COLUMNS)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .returns<Sighting[]>();
  const sightings = data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold">{t("greeting", { name: profile.display_name })}</h1>
        <form action={signOut}>
          <button type="submit" className="btn-secondary !py-1.5 text-sm">{t("logout")}</button>
        </form>
      </div>

      {profile.banned_at ? <p className="card mb-6 p-4 font-semibold">{t("banned")}</p> : null}

      <section className="mb-8">
        <h2 className="mb-3 font-display text-2xl font-semibold">{t("mySightings", { count: sightings.length })}</h2>
        {sightings.length === 0 ? (
          <div className="card p-6 text-center">
            <p>{t("empty")}</p>
            <Link href="/new" className="btn-primary mt-3">{t("first")}</Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {sightings.map((s) => (
              <li key={s.id} className="flex flex-col gap-2">
                <SightingCard s={s} showHidden />
                <div className="flex gap-2 pl-2">
                  <Link href={`/s/${s.id}/edit`} className="btn-secondary !px-3 !py-1 text-sm">✏️ {t("edit")}</Link>
                  <DeleteSightingButton id={s.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card mb-8 p-5">
        <h2 className="mb-3 font-display text-2xl font-semibold">{t("profile")}</h2>
        <DisplayNameForm initial={profile.display_name} />
        <p className="mt-3 text-sm text-ink/70">{t("emailPrivate", { email: profile.email })}</p>
      </section>

      <section className="card border-hat p-5">
        <h2 className="mb-2 font-display text-2xl font-semibold text-hat-dark">{t("dangerZone")}</h2>
        <DeleteAccount />
      </section>
    </div>
  );
}
