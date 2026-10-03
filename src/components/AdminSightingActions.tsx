"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { dismissReports, setSightingHidden, setUserBanned } from "@/app/actions/admin";
import { deleteSighting } from "@/app/actions/sightings";
import type { ActionResult } from "@/app/actions/sightings";

export function AdminSightingActions({
  id,
  userId,
  hidden,
  userBanned = false,
  hasReports = false,
  redirectAfterDelete,
}: {
  id: string;
  userId: string;
  hidden: boolean;
  userBanned?: boolean;
  hasReports?: boolean;
  redirectAfterDelete?: string;
}) {
  const t = useTranslations("admin");
  const te = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, confirmText?: string, after?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await action();
      if (!res.ok) return window.alert(te(res.error));
      if (after) router.push(after);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-dashed border-ink p-2" aria-label={t("actions")}>
      <span className="self-center px-1 text-xs font-bold uppercase">{t("adminLabel")}</span>
      <button type="button" disabled={pending} className="btn-secondary !px-3 !py-1 text-sm" onClick={() => run(() => setSightingHidden(id, !hidden))}>
        {hidden ? t("unhide") : t("hide")}
      </button>
      <button type="button" disabled={pending} className="btn-danger !px-3 !py-1 text-sm" onClick={() => run(() => deleteSighting(id), t("confirmDelete"), redirectAfterDelete)}>
        {t("delete")}
      </button>
      <button type="button" disabled={pending} className="btn-danger !px-3 !py-1 text-sm" onClick={() => run(() => setUserBanned(userId, !userBanned), userBanned ? undefined : t("confirmBan"))}>
        {userBanned ? t("unban") : t("ban")}
      </button>
      {hasReports ? (
        <button type="button" disabled={pending} className="btn-secondary !px-3 !py-1 text-sm" onClick={() => run(() => dismissReports(id))}>
          {t("dismiss")}
        </button>
      ) : null}
    </div>
  );
}
