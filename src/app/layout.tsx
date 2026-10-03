import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HatSpottedButton } from "@/components/HatSpottedButton";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const nunito = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font-nunito", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `HatSpotted – ${t("tagline")}`, template: "%s · HatSpotted" },
    description: t("description"),
    applicationName: "HatSpotted",
    openGraph: { siteName: "HatSpotted", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#e63946",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1 pb-28">{children}</main>
          <Footer />
          <HatSpottedButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
