"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { HatIcon } from "./HatLogo";

type Mode = "signin" | "signup" | "forgot";
type Status = { kind: "error" | "info"; text: string } | null;

export const PASSWORD_MIN = 8;

/** Map Supabase auth errors to translated message keys. */
function authErrorKey(error: { code?: string; message?: string; status?: number }): string {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "user_already_exists":
    case "email_exists":
      return "accountExists";
    case "weak_password":
      return "weakPassword";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "rateLimited";
    case "email_address_invalid":
      return "invalidEmail";
  }
  if (error.status === 429) return "rateLimited";
  return "error";
}

export function LoginPanel({ next = "/", reason }: { next?: string; reason?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const callbackUrl = (target: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;

  // After a password login, /onboarding asks for a display name if needed
  // and otherwise forwards to `next`. A full navigation picks up the new cookies.
  const finish = () => window.location.assign(`/onboarding?next=${encodeURIComponent(next)}`);

  function switchMode(m: Mode) {
    setMode(m);
    setStatus(null);
  }

  async function google() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl(next) },
    });
    if (error) setStatus({ kind: "error", text: t("googleError") });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const supabase = createClient();
    const cleanEmail = email.trim();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) return setStatus({ kind: "error", text: t(authErrorKey(error)) });
        return finish();
      }

      if (mode === "signup") {
        if (password.length < PASSWORD_MIN) {
          return setStatus({ kind: "error", text: t("weakPassword") });
        }
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: callbackUrl(next), data: { language: locale } },
        });
        if (error) return setStatus({ kind: "error", text: t(authErrorKey(error)) });
        // Supabase hides whether an address is registered: an existing account
        // comes back as a user without identities.
        if (data.user && data.user.identities?.length === 0) {
          setMode("signin");
          return setStatus({ kind: "error", text: t("accountExists") });
        }
        if (data.session) return finish(); // e-mail confirmation turned off
        return setStatus({ kind: "info", text: t("confirmSent", { email: cleanEmail }) });
      }

      // forgot password
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: callbackUrl("/reset-password"),
      });
      if (error) return setStatus({ kind: "error", text: t(authErrorKey(error)) });
      setStatus({ kind: "info", text: t("resetSent", { email: cleanEmail }) });
    } catch {
      setStatus({ kind: "error", text: t("error") });
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signup" ? t("signupTitle") : mode === "forgot" ? t("forgotTitle") : t("title");
  const submitLabel = mode === "signup" ? t("createAccount") : mode === "forgot" ? t("sendReset") : t("signIn");

  return (
    <div className="card mx-auto w-full max-w-md p-6">
      <div className="mb-4 flex flex-col items-center text-center">
        <HatIcon className="h-16 w-16" />
        <h1 className="mt-2 font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-ink/75">{mode === "forgot" ? t("forgotIntro") : (reason ?? t("intro"))}</p>
      </div>

      {mode !== "forgot" ? (
        <>
          <button type="button" onClick={google} className="btn-secondary w-full !py-3">
            <GoogleG /> {t("google")}
          </button>
          <div className="my-4 flex items-center gap-3 text-sm font-semibold text-ink/60">
            <span className="h-0.5 flex-1 bg-ink/15" /> {t("or")} <span className="h-0.5 flex-1 bg-ink/15" />
          </div>
          <div className="mb-4 grid grid-cols-2 rounded-full border-2 border-ink bg-white p-1" role="tablist">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-full py-1.5 text-sm font-bold transition ${mode === m ? "bg-ink text-white" : "hover:bg-sun"}`}
              >
                {m === "signin" ? t("tabSignIn") : t("tabSignUp")}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="email" className="label !mb-1 !text-base">{t("emailLabel")}</label>
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
        </div>
        {mode !== "forgot" ? (
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="label !mb-1 !text-base">{t("passwordLabel")}</label>
              {mode === "signin" ? (
                <button type="button" onClick={() => switchMode("forgot")} className="text-sm font-semibold underline">
                  {t("forgotLink")}
                </button>
              ) : null}
            </div>
            <input
              id="password"
              type="password"
              required
              minLength={mode === "signup" ? PASSWORD_MIN : undefined}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            {mode === "signup" ? <p className="mt-1 text-sm text-ink/70">{t("passwordHint", { min: PASSWORD_MIN })}</p> : null}
          </div>
        ) : null}

        {status ? (
          <p
            className={`rounded-2xl border-2 p-3 text-sm font-semibold ${status.kind === "error" ? "border-hat text-hat-dark" : "border-ink bg-sky/40"}`}
            role={status.kind === "error" ? "alert" : "status"}
          >
            {status.text}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
          {busy ? "…" : submitLabel}
        </button>
      </form>

      {mode === "forgot" ? (
        <button type="button" onClick={() => switchMode("signin")} className="mt-4 w-full text-sm font-semibold underline">
          ← {t("backToSignIn")}
        </button>
      ) : null}
      <p className="mt-4 text-center text-xs text-ink/60">{t("privacyNote")}</p>
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
