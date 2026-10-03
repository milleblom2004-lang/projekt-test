"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/app/actions/account";

export function DeleteAccount() {
  const t = useTranslations("me");
  const te = useTranslations("errors");
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const word = "DELETE";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await deleteAccount(confirm);
          if (!res.ok) return setError(te(res.error));
          router.push("/?deleted=1");
          router.refresh();
        });
      }}
      className="flex flex-col gap-3"
    >
      <p>{t("deleteAccountWarning")}</p>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{t("deleteAccountConfirm", { word })}</span>
        <input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" autoComplete="off" />
      </label>
      {error ? <p className="text-sm font-semibold text-hat-dark" role="alert">{error}</p> : null}
      <button type="submit" disabled={pending || confirm.trim().toUpperCase() !== word} className="btn-danger">
        {pending ? "…" : t("deleteAccount")}
      </button>
    </form>
  );
}
