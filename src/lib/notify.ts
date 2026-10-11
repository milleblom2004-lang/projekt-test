import "server-only";
import { thumbUrl } from "./images";
import { countryName } from "./place";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.hatspotted.com").replace(/\/$/, "");

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface NewSightingNotice {
  id: string;
  imageUrl: string;
  placeName: string | null;
  country: string | null;
  sightedAt: Date;
  description: string | null;
  displayName: string | null;
}

/**
 * E-mail the site owner about a new sighting via Resend.
 * Does nothing unless RESEND_API_KEY and ADMIN_NOTIFY_EMAIL are set; never throws.
 */
export async function notifyNewSighting(s: NewSightingNotice) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const place =
    [s.placeName, s.country ? countryName(s.country, "en") : null].filter(Boolean).join(", ") ||
    "Unknown place";
  const link = `${SITE_URL}/s/${s.id}`;
  const when = s.sightedAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  });

  const html = `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;background:#fff8ec;border-radius:16px;color:#1d3557">
  <h1 style="margin:0 0 4px;font-size:24px">🎩 New sighting!</h1>
  <p style="margin:0 0 16px;font-size:18px;font-weight:bold">📍 ${esc(place)}</p>
  <a href="${link}"><img src="${esc(thumbUrl(s.imageUrl))}" alt="" width="240" height="240" style="border-radius:12px;border:3px solid #1d3557;display:block"></a>
  <p style="margin:16px 0 4px"><b>Spotted:</b> ${esc(when)} (Swedish time)</p>
  <p style="margin:0 0 4px"><b>By:</b> ${esc(s.displayName ?? "unknown")}</p>
  ${s.description ? `<p style="margin:8px 0;padding:10px;background:#fff;border-radius:8px">${esc(s.description)}</p>` : ""}
  <p style="margin:20px 0 0">
    <a href="${link}" style="background:#e63946;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">View sighting</a>
    &nbsp;<a href="${SITE_URL}/admin?tab=recent" style="color:#1d3557">Moderate</a>
  </p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "HatSpotted <no-reply@hatspotted.com>",
        to: to.split(",").map((e) => e.trim()).filter(Boolean),
        subject: `🎩 New sighting: ${place}`,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("notifyNewSighting failed", res.status, await res.text());
  } catch (err) {
    console.error("notifyNewSighting error", err);
  }
}
