import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import { DisplayNameForm } from "@/components/DisplayNameForm";
import { HatIcon } from "@/components/HatLogo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return { title: t("title"), robots: { index: false } };
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const profile = await getProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (profile.display_name) redirect(next);
  const t = await getTranslations("onboarding");

  return (
    <div className="px-4 py-10">
      <div className="card mx-auto max-w-md p-6">
        <div className="mb-4 flex flex-col items-center text-center">
          <HatIcon className="h-16 w-16" />
          <h1 className="mt-2 font-display text-3xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-ink/75">{t("intro")}</p>
        </div>
        <DisplayNameForm next={next} />
      </div>
    </div>
  );
}
