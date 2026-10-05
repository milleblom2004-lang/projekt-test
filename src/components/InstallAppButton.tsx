"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios-safari" | "ios-other" | "other";

/**
 * "Install the app" link. Uses the browser's native install prompt where
 * available (Chrome/Edge/Android) and shows instructions elsewhere (iPhone).
 * Hidden when the site already runs as an installed app.
 */
export function InstallAppButton() {
  const t = useTranslations("install");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(true); // hidden until we know
  const [platform, setPlatform] = useState<Platform>("other");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setStandalone(isStandalone);

    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
    if (ios) setPlatform(/CriOS|FxiOS|EdgiOS/.test(ua) ? "ios-other" : "ios-safari");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setStandalone(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone) return null;

  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      await installEvent.userChoice.catch(() => undefined);
      setInstallEvent(null);
    } else {
      setOpen(true);
    }
  }

  const shareIcon = (
    <svg viewBox="0 0 24 24" className="inline h-5 w-5 align-text-bottom" aria-label="Share">
      <path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <>
      <button type="button" onClick={install} className="font-semibold underline-offset-4 hover:underline">
        {t("button")}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[1300] flex items-end justify-center bg-ink/50 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-title"
          onClick={() => setOpen(false)}
        >
          <div className="card w-full max-w-md p-5 text-base" onClick={(e) => e.stopPropagation()}>
            <h2 id="install-title" className="mb-3 font-display text-2xl font-bold">{t("title")}</h2>
            {platform === "ios-other" ? <p className="mb-3 rounded-2xl bg-sun/50 p-3 font-semibold">{t("iosChrome")}</p> : null}
            <ol className="list-decimal space-y-2 pl-5">
              {platform === "other" ? (
                <>
                  <li>{t("otherStep1")}</li>
                  <li>{t("otherStep2")}</li>
                </>
              ) : (
                <>
                  <li>{t.rich("iosStep1", { icon: () => shareIcon })}</li>
                  <li>{t("iosStep2")}</li>
                  <li>{t("iosStep3")}</li>
                </>
              )}
            </ol>
            <button type="button" onClick={() => setOpen(false)} className="btn-primary mt-4 w-full">{t("close")}</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
