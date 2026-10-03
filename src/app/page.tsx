import { getTranslations } from "next-intl/server";
import { SightingsMapLoader } from "@/components/map/MapLoader";

export default async function HomePage() {
  const t = await getTranslations("home");
  return (
    <div className="-mb-28 flex h-[calc(100dvh-62px)] flex-col">
      <div className="border-b-2 border-ink bg-sun px-4 py-2 text-center">
        <h1 className="font-display text-base font-semibold sm:text-lg">{t("headline")}</h1>
      </div>
      <div className="relative min-h-0 flex-1">
        <SightingsMapLoader />
      </div>
    </div>
  );
}
