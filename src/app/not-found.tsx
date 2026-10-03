import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HatIcon } from "@/components/HatLogo";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <HatIcon className="h-24 w-24 -rotate-12" />
      <h1 className="mt-4 font-display text-4xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-ink/75">{t("text")}</p>
      <Link href="/" className="btn-primary mt-6">{t("back")}</Link>
    </div>
  );
}
