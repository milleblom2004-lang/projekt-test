import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HatIcon } from "./HatLogo";
import { InstallAppButton } from "./InstallAppButton";

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="border-t-2 border-ink bg-white pb-28 sm:pb-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm">
        <div className="flex items-center gap-2 font-display text-base font-semibold">
          <HatIcon className="h-6 w-6" />
          <span>{t("tagline")}</span>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
          <Link href="/about" className="underline-offset-4 hover:underline">{t("about")}</Link>
          <Link href="/terms" className="underline-offset-4 hover:underline">{t("terms")}</Link>
          <Link href="/privacy" className="underline-offset-4 hover:underline">{t("privacy")}</Link>
          <InstallAppButton />
        </nav>
        <p className="max-w-3xl text-ink/70">{t("disclaimer")}</p>
        <p className="text-ink/60">
          {t("mapCredit")}{" "}
          <a href="https://www.openstreetmap.org/copyright" className="underline" target="_blank" rel="noreferrer">
            © OpenStreetMap
          </a>
        </p>
      </div>
    </footer>
  );
}
