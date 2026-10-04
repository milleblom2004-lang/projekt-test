"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { PASSWORD_MIN } from "./LoginPanel";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < PASSWORD_MIN) return setError(t("weakPassword"));
    if (password !== confirm) return setError(t("passwordMismatch"));
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.code === "same_password" ? t("samePassword") : t("weakPassword"));
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-3 text-center" role="status">
        <p className="font-semibold">{t("passwordUpdated")}</p>
        <Link href="/" className="btn-primary">{t("continue")}</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="new-password" className="label !mb-0 !text-base">{t("newPassword")}</label>
      <input id="new-password" type="password" required minLength={PASSWORD_MIN} autoComplete="new-password"
        value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
      <p className="text-sm text-ink/70">{t("passwordHint", { min: PASSWORD_MIN })}</p>
      <label htmlFor="confirm-password" className="label !mb-0 !text-base">{t("confirmPassword")}</label>
      <input id="confirm-password" type="password" required autoComplete="new-password"
        value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" />
      {error ? <p className="text-sm font-semibold text-hat-dark" role="alert">{error}</p> : null}
      <button type="submit" disabled={busy} className="btn-primary !py-3">{busy ? "…" : t("savePassword")}</button>
    </form>
  );
}
