import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProfile } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { HatIcon } from "@/components/HatLogo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("newPasswordTitle"), robots: { index: false } };
}

// Reached through the e-mail link from "Forgot password?" (via /auth/callback,
// which signs the user in first).
export default async function ResetPasswordPage() {
  if (!(await getProfile())) redirect("/login?error=1");
  const t = await getTranslations("auth");
  return (
    <div className="px-4 py-10">
      <div className="card mx-auto max-w-md p-6">
        <div className="mb-4 flex flex-col items-center text-center">
          <HatIcon className="h-16 w-16" />
          <h1 className="mt-2 font-display text-3xl font-bold">{t("newPasswordTitle")}</h1>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
