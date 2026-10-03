"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setUserBanned } from "@/app/actions/admin";

export function UnbanButton({ userId }: { userId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-secondary !px-3 !py-1 text-sm"
      onClick={() =>
        startTransition(async () => {
          await setUserBanned(userId, false);
          router.refresh();
        })
      }
    >
      {t("unban")}
    </button>
  );
}
