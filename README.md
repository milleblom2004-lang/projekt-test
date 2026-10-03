# HatSpotted

> Community sightings of the striped hat – a fan project

HatSpotted is a non-commercial community site. People upload a photo of a striped-hat
sighting, pin where it happened on a world map, and everyone can browse the map and feed.
It is an independent fan project with no affiliation with Dr. Seuss Enterprises or any other
rights holder. The logo is an original illustration of a striped hat.

**Stack:** Next.js 16 (App Router) · Supabase (Auth, Postgres, Storage) · next-intl ·
Leaflet + OpenStreetMap + markercluster · sharp · Tailwind CSS 4

## Features

- **Map** (home): every sighting as a hat marker. Nearby markers are clustered, and a popup shows the photo, date, description and display name. The map starts on the whole world; it zooms to your area when location permission is already granted, or when you tap "Near me".
- **Feed**: newest first, with thumbnail and "city, country". Filter by last 24 h / 7 days / all and by country.
- **Hat spotted!**: a large button that is always visible. Login is only requested here.
  - Photo upload: jpg/png/heic, max 10 MB. The browser shrinks the photo and strips its metadata. The server then checks the real file type from its first bytes, converts HEIC, resizes, re-encodes to JPEG and **removes all EXIF/GPS** with sharp. It stores a full image and a thumbnail.
  - Location: tap the map, search for an address (Nominatim) or tap "Use my location". The marker can be dragged to fine-tune.
  - Date and time (prefilled with now, in your local time), plus an optional description of up to 280 characters.
  - Required consent checkbox. Publish stays disabled until it is checked, and `consent_given_at` is stored with the post.
- **Sighting page** `/s/[id]`: share button (native share or copy link), report button, Open Graph preview image.
- **My page**: edit or delete your sightings, change your display name, and delete your account (removes all posts and photos).
- **Moderation** `/admin`: see reported sightings, hide/unhide, delete, ban/unban users (banning also hides all their posts) and dismiss reports.
- **Auth**: "Continue with Google" or a magic link (no passwords). On first login you choose a display name. E-mail addresses are never shown publicly.
- **i18n**: English (default) and Swedish. The language is picked automatically from the browser, and there is a switcher in the header. Dates are shown in the viewer's locale and time zone.
- **Footer pages**: About, Terms of Use, Privacy Policy (GDPR), each with the "no affiliation" disclaimer.

## Setup

1. **Create a Supabase project** and copy `.env.example` to `.env.local`. Fill in the URL, the anon key and the service role key. Also set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` and `NOMINATIM_USER_AGENT`.
2. **Run the migration** in `supabase/migrations/` with `supabase db push` or the SQL editor. It creates the tables, row-level security, rate-limit triggers and the public `sightings` storage bucket.
3. **Auth settings** (Supabase → Authentication):
   - URL configuration: set the Site URL and add `https://your-domain/auth/callback` (and `http://localhost:3000/auth/callback`) to the redirect URLs.
   - Providers: enable Email (magic link) and Google (OAuth client ID/secret from Google Cloud, with `https://<project>.supabase.co/auth/v1/callback` as the authorised redirect).
   - For production, configure custom SMTP so magic links are delivered reliably.
4. **Make yourself admin** after signing in once:
   ```sql
   update public.users set role = 'admin' where email = 'you@example.com';
   ```
5. Start the app:
   ```bash
   npm install
   npm run dev        # http://localhost:3000
   npm test           # unit tests (validation, file detection, EXIF stripping, i18n)
   npm run typecheck
   ```

## Security model

- Anyone can read visible sightings and public display names. `email` and `role` are protected with column-level grants and are only reachable through `get_my_profile()`, which returns the caller's own row.
- Clients have **no write access** to sightings, reports or storage. Every write goes through server actions. These check the session, ownership or admin role, ban status, input (zod), file size and real file type, and rate limits, and only then use the service-role key (server-only).
- Users can only edit or delete their own posts. Admins can hide or delete any post.
- Upload limit: 10 per hour and 30 per day per user, checked in the server action and enforced again by a database trigger. Reports: 20 per hour. Address search: 20 per minute per IP. Nominatim calls are throttled to 1 per second and cached.
- Redirect targets after login are restricted to relative paths (no open redirects).

## Data

| Table | Columns |
| --- | --- |
| `users` | id, display_name, email, created_at, role, language, banned_at (moderation only) |
| `sightings` | id, user_id, image_url, latitude, longitude, place_name, country (ISO code), sighted_at, description, created_at, hidden, consent_given_at |
| `reports` | id, sighting_id, user_id, reason, created_at |

Photos live in Supabase Storage (`sightings/<user_id>/<id>.jpg` and `_thumb.jpg`), not in the database.
Deleting an account deletes the auth user. Postgres cascades the delete to the profile, sightings and reports, and the server removes the user's storage folder.

## Adding a language

1. Add the code to `locales` in `src/i18n/config.ts`.
2. Add `messages/<code>.json` (copy `en.json`).
3. Optionally add translated legal pages in `src/content/legal/<code>.tsx` and register them in `src/content/legal/index.ts`. Missing ones fall back to English.

## Deployment notes

- Any Node host works (e.g. Vercel). Photos are compressed in the browser, so typical uploads are well under 1 MB. HEIC files that a browser can't decode are sent as-is, up to 10 MB; on Vercel, bodies over 4.5 MB are rejected, so self-host or use a plan or region that allows larger bodies if many users upload HEIC from non-Safari browsers.
- The legal texts are templates. Review them, fill in who runs the site, and adjust the governing law before going live.
- Map tiles come from the public OpenStreetMap tile servers, which are fine for small community traffic. Switch `TILE_URL` in `src/components/map/leaflet-setup.ts` to a tile provider if traffic grows.
