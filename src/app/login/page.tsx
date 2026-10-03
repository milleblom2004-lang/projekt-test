import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginPanel } from "@/components/LoginPanel";
import { getProfile } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("title"), robots: { index: false } };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNext(next);
  if (await getProfile()) redirect(target);
  const t = await getTranslations("auth");
  return (
    <div className="px-4 py-10">
      {error ? (
        <p className="mx-auto mb-4 max-w-md rounded-2xl border-2 border-ink bg-sun p-3 text-center font-semibold" role="alert">
          {t("callbackError")}
        </p>
      ) : null}
      <LoginPanel next={target} />
    </div>
  );
}
