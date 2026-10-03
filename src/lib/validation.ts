import { z } from "zod";

export const DESCRIPTION_MAX = 280;
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 30;
export const REPORT_REASONS = ["inappropriate", "not_a_hat", "privacy", "copyright", "spam", "other"] as const;

const coord = (min: number, max: number) =>
  z
    .string({ message: "invalid_location" })
    .trim()
    .min(1, "invalid_location")
    .transform(Number)
    .refine((n) => Number.isFinite(n) && n >= min && n <= max, "invalid_location");

/** Sighting time: a real date, not in the future (5 min clock skew allowed), not before 1957. */
const sightedAt = z
  .string({ message: "invalid_date" })
  .transform((s) => new Date(s))
  .refine((d) => !Number.isNaN(d.getTime()), "invalid_date")
  .refine((d) => d.getTime() <= Date.now() + 5 * 60_000, "date_in_future")
  .refine((d) => d.getUTCFullYear() >= 1957, "invalid_date");

const description = z
  .string()
  .optional()
  .transform((s) => (s ?? "").replace(/\r\n/g, "\n").trim())
  .refine((s) => [...s].length <= DESCRIPTION_MAX, "description_too_long")
  .transform((s) => (s.length ? s : null));

export const sightingFieldsSchema = z.object({
  latitude: coord(-90, 90),
  longitude: coord(-180, 180),
  sighted_at: sightedAt,
  description,
});

export const newSightingSchema = sightingFieldsSchema.extend({
  consent: z.literal("true", { message: "consent_required" }),
});

export const displayNameSchema = z
  .string()
  .transform((s) => s.normalize("NFC").trim().replace(/\s+/g, " "))
  .refine(
    (s) => [...s].length >= DISPLAY_NAME_MIN && [...s].length <= DISPLAY_NAME_MAX,
    "display_name_length",
  )
  // letters, numbers, spaces and a few separators; no "@" so e-mails can't be used
  .refine((s) => /^[\p{L}\p{N}][\p{L}\p{N} ._'-]*$/u.test(s), "display_name_chars");

export const reportSchema = z.object({
  sighting_id: z.string().uuid(),
  reason: z.enum(REPORT_REASONS),
  details: z
    .string()
    .optional()
    .transform((s) => (s ?? "").trim().slice(0, 400)),
});

/** Turn a zod error into a single message key for the UI. */
const KNOWN_KEYS = new Set([
  "invalid_location",
  "invalid_date",
  "date_in_future",
  "description_too_long",
  "consent_required",
  "display_name_length",
  "display_name_chars",
]);

export function firstErrorKey(error: z.ZodError): string {
  const message = error.issues[0]?.message;
  return message && KNOWN_KEYS.has(message) ? message : "invalid_input";
}
