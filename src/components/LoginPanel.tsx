"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { HatIcon } from "./HatLogo";

export function LoginPanel({ next = "/", reason }: { next?: string; reason?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function google() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setState("error");
  }

  async function magicLink(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo(), data: { language: locale } },
    });
    setState(error ? "error" : "sent");
  }

  return (
    <div className="card mx-auto w-full max-w-md p-6">
      <div className="mb-4 flex flex-col items-center text-center">
        <HatIcon className="h-16 w-16" />
        <h1 className="mt-2 font-display text-3xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-ink/75">{reason ?? t("intro")}</p>
      </div>

      {state === "sent" ? (
        <div className="rounded-2xl border-2 border-ink bg-sky/40 p-4 text-center" role="status">
          <p className="font-display text-xl font-semibold">{t("linkSent")}</p>
          <p className="mt-1 text-sm">{t("linkSentHint", { email })}</p>
        </div>
      ) : (
        <>
          <button type="button" onClick={google} className="btn-secondary w-full !py-3">
            <GoogleG /> {t("google")}
          </button>
          <div className="my-4 flex items-center gap-3 text-sm font-semibold text-ink/60">
            <span className="h-0.5 flex-1 bg-ink/15" /> {t("or")} <span className="h-0.5 flex-1 bg-ink/15" />
          </div>
          <form onSubmit={magicLink} className="flex flex-col gap-3">
            <label htmlFor="email" className="label !mb-0">{t("emailLabel")}</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="input"
            />
            <button type="submit" disabled={state === "sending"} className="btn-primary w-full !py-3">
              {state === "sending" ? t("sending") : t("sendLink")}
            </button>
          </form>
          {state === "error" ? <p className="mt-3 text-sm font-semibold text-hat-dark" role="alert">{t("error")}</p> : null}
          <p className="mt-4 text-center text-xs text-ink/60">{t("noPasswords")}</p>
        </>
      )}
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
