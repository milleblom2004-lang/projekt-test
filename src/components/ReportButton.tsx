"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { reportSighting } from "@/app/actions/reports";
import { REPORT_REASONS } from "@/lib/validation";

export function ReportButton({ sightingId, loggedIn }: { sightingId: string; loggedIn: boolean }) {
  const t = useTranslations("report");
  const te = useTranslations("errors");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("inappropriate");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<"done" | string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await reportSighting({ sighting_id: sightingId, reason, details });
      setResult(res.ok ? "done" : te(res.error));
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        🚩 {t("button")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-ink/50 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="report-title" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h2 id="report-title" className="mb-3 font-display text-2xl font-bold">{t("title")}</h2>
            {!loggedIn ? (
              <div className="flex flex-col gap-3">
                <p>{t("loginRequired")}</p>
                <Link href={`/login?next=/s/${sightingId}`} className="btn-primary">{t("login")}</Link>
              </div>
            ) : result === "done" ? (
              <p className="font-semibold" role="status">{t("thanks")}</p>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="mb-1 font-semibold">{t("reason")}</legend>
                  {REPORT_REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-2">
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="h-5 w-5 accent-hat" />
                      {t(`reasons.${r}`)}
                    </label>
                  ))}
                </fieldset>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold">{t("details")}</span>
                  <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={400} rows={2} className="input" />
                </label>
                {result ? <p className="text-sm font-semibold text-hat-dark" role="alert">{result}</p> : null}
                <button type="submit" disabled={pending} className="btn-primary">{pending ? "…" : t("submit")}</button>
              </form>
            )}
            <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full text-sm font-semibold underline">
              {t("close")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
