"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ShareButton({ title }: { title: string }) {
  const t = useTranslations("sighting");
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("copyPrompt"), url);
    }
  }

  return (
    <button type="button" onClick={share} className="btn-secondary">
      🔗 {copied ? t("copied") : t("share")}
    </button>
  );
}
