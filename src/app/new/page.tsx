import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { LoginPanel } from "@/components/LoginPanel";
import { NewSightingForm } from "@/components/NewSightingForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("form");
  return { title: t("title") };
}

export default async function NewSightingPage() {
  const t = await getTranslations("form");
  const profile = await getProfile();

  // Login is only requested here, when someone actually wants to post.
  if (!profile) {
    return (
      <div className="px-4 py-10">
        <LoginPanel next="/new" reason={t("loginReason")} />
      </div>
    );
  }
  if (!profile.display_name) redirect("/onboarding?next=/new");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-1 font-display text-4xl font-bold">{t("title")}</h1>
      <p className="mb-6 text-ink/75">{t("intro")}</p>
      {profile.banned_at ? (
        <p className="card p-4 font-semibold">{t("banned")}</p>
      ) : (
        <NewSightingForm />
      )}
    </div>
  );
}
