import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { HatIcon, Wordmark } from "./HatLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { locales } from "@/i18n/config";
import { NavLink } from "./NavLink";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const t = await getTranslations("nav");
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-[1100] border-b-2 border-ink bg-cream/95 backdrop-blur">
      <div className="stripes h-1.5" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-1" aria-label="HatSpotted">
          <HatIcon className="h-8 w-8 sm:h-9 sm:w-9" />
          <Wordmark className="!text-lg min-[400px]:!text-xl sm:!text-2xl" />
        </Link>
        <nav className="ml-auto flex items-center gap-0.5 whitespace-nowrap text-[13px] font-semibold min-[400px]:text-sm sm:gap-2 sm:text-base">
          <NavLink href="/">{t("map")}</NavLink>
          <NavLink href="/feed">{t("feed")}</NavLink>
          {profile ? (
            <UserMenu isAdmin={profile.role === "admin"} />
          ) : (
            <NavLink href="/login">{t("login")}</NavLink>
          )}
          {locales.length > 1 ? <LanguageSwitcher /> : null}
        </nav>
      </div>
    </header>
  );
}
