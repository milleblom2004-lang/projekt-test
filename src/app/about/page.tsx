import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { legalFor } from "@/content/legal";
import { LocalTime } from "@/components/LocalTime";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("footer");
  return { title: t("about") };
}

export default async function Page() {
  const t = await getTranslations("footer");
  const legal = legalFor(await getLocale());
  const Content = legal.About;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <article className="card prose-legal p-5 sm:p-8">
        <h1 className="mb-4 font-display text-4xl font-bold">{t("about")}</h1>
        <Content />
        <p className="mt-8 text-sm text-ink/60">
          {t("updated")} <LocalTime iso={legal.updated} dateOnly />
        </p>
      </article>
    </div>
  );
}
