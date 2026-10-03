"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteSighting } from "@/app/actions/sightings";

export function DeleteSightingButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const t = useTranslations("sighting");
  const te = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="btn-danger"
      onClick={() => {
        if (!window.confirm(t("confirmDelete"))) return;
        startTransition(async () => {
          const res = await deleteSighting(id);
          if (!res.ok) return window.alert(te(res.error));
          if (redirectTo) router.push(redirectTo);
          router.refresh();
        });
      }}
    >
      🗑️ {pending ? "…" : t("delete")}
    </button>
  );
}
