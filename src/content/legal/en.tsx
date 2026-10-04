import Link from "next/link";

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com";
const Mail = () => <a href={`mailto:${contact}`}>{contact}</a>;

export const updated = "2026-10-03";

export function About() {
  return (
    <>
      <p>
        HatSpotted is a non-commercial community site where fans share sightings of the famous
        red-and-white striped hat – at costume parties, school reading days, parades, shop windows
        or anywhere else it pops up. Snap a photo, pin it on the map and see where the hat has been
        spotted around the world.
      </p>
      <h2>A fan project – no affiliation</h2>
      <p>
        <strong>
          HatSpotted is an independent fan project. It is not affiliated with, endorsed by or
          sponsored by Dr. Seuss Enterprises, L.P. or any other rights holder.
        </strong>{" "}
        All trademarks and characters belong to their respective owners. We do not use official
        images, logos, fonts or characters; our hat logo is an original illustration.
      </p>
      <h2>How it works</h2>
      <ul>
        <li>Anyone can browse the map and the feed – no account needed.</li>
        <li>To post a sighting, sign in with Google or with your e-mail and a password.</li>
        <li>Only your chosen display name is shown publicly – never your e-mail address.</li>
        <li>Location data (EXIF/GPS) is removed from every photo before it is stored.</li>
        <li>See something that should not be here? Use the “Report” button on the sighting.</li>
      </ul>
      <h2>Contact</h2>
      <p>
        Questions, takedown requests or feedback: <Mail />.
      </p>
    </>
  );
}

export function Terms() {
  return (
    <>
      <p>
        By using HatSpotted (“the site”, “we”) you agree to these terms. If you do not agree,
        please do not use the site.
      </p>
      <h2>1. A non-commercial fan project</h2>
      <p>
        HatSpotted is a free, non-commercial fan project with no affiliation with Dr. Seuss
        Enterprises, L.P. or any other rights holder. The site is provided “as is”, without
        warranties of any kind, and may change or close at any time.
      </p>
      <h2>2. Accounts</h2>
      <p>
        You need an account to post or report sightings. You must be at least 13 years old (or
        older if required where you live) to create an account. Your display name must not
        impersonate others or be offensive. You are responsible for activity on your account.
      </p>
      <h2>3. Your content</h2>
      <ul>
        <li>You may only upload photos that you took yourself.</li>
        <li>
          Do not upload photos where people can be identified unless they have agreed to it, and
          never upload identifiable photos of children without their guardian’s consent.
        </li>
        <li>
          Do not upload anything illegal, hateful, violent, sexual, harassing or that infringes
          someone else’s rights, and do not reveal private addresses or other personal details.
        </li>
        <li>
          Think before you pin: the location you choose is shown publicly. Avoid pinning your own
          or someone else’s home.
        </li>
      </ul>
      <h2>4. Permission to display</h2>
      <p>
        You keep the copyright to your photos. By publishing a sighting you confirm that you took
        the photo yourself and you give HatSpotted a free, non-exclusive, worldwide permission to
        store, resize and display it (together with your display name, description, time and
        location) on the site and in share previews. The permission ends when you delete the
        sighting or your account, apart from short-lived backups and copies others may already
        have shared.
      </p>
      <h2>5. Moderation</h2>
      <p>
        We may hide or remove any content and suspend or ban accounts that break these terms, at
        our discretion and without prior notice. Uploads are rate limited to prevent abuse.
        Rights holders can request removal of content by contacting <Mail />.
      </p>
      <h2>6. Liability</h2>
      <p>
        Content is published by users and does not represent our views. To the extent permitted
        by law, we are not liable for any loss arising from use of the site. Nothing in these
        terms limits rights you have under mandatory consumer law.
      </p>
      <h2>7. Changes and governing law</h2>
      <p>
        We may update these terms; the date below shows the latest version. Significant changes
        will be announced on the site. These terms are governed by Swedish law, without prejudice
        to mandatory protections in your country of residence.
      </p>
      <p>
        See also our <Link href="/privacy">Privacy Policy</Link>. Contact: <Mail />.
      </p>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <p>
        This policy explains what personal data HatSpotted processes, why, and what rights you
        have under the EU General Data Protection Regulation (GDPR). We collect as little as
        possible.
      </p>
      <h2>Controller</h2>
      <p>
        HatSpotted is run as a private, non-commercial fan project. Contact for all privacy
        matters: <Mail />.
      </p>
      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Account:</strong> e-mail address, display name, preferred language, role
          (user/admin), account creation time and, if applicable, the time an account was banned.
          Your e-mail address is never shown publicly. If you use a password, it is stored only
          as a secure one-way hash by our authentication provider – we can never see it.
        </li>
        <li>
          <strong>Sightings:</strong> the photo, the location you chose (latitude/longitude, plus
          the city and country derived from it), the sighting time, your description, when it was
          posted and when you gave consent to display the photo.
        </li>
        <li>
          <strong>Reports:</strong> which sighting you reported, the reason and when.
        </li>
        <li>
          <strong>Technical data:</strong> our authentication provider keeps sign-in logs (such
          as IP address and time) for security. We do not use analytics or advertising trackers.
        </li>
      </ul>
      <p>
        Photos are re-encoded on upload and <strong>all embedded metadata (EXIF), including GPS
        coordinates and camera details, is removed</strong> before storage. Only the location you
        pick on the map is published.
      </p>
      <h2>Why, and legal basis</h2>
      <ul>
        <li>Providing your account and publishing your sightings – performance of our agreement with you (Art. 6(1)(b)).</li>
        <li>Displaying your photo – your consent, given with the checkbox when you publish (Art. 6(1)(a)). You can withdraw it at any time by deleting the sighting.</li>
        <li>Moderation, abuse prevention and security (reports, bans, rate limits, logs) – our legitimate interest in a safe site (Art. 6(1)(f)).</li>
      </ul>
      <h2>Who else processes data</h2>
      <ul>
        <li><strong>Supabase</strong> – database, authentication, photo storage (data processor).</li>
        <li><strong>Our web host</strong> – runs the site and receives standard request data such as IP addresses.</li>
        <li><strong>Google</strong> – only if you choose “Continue with Google”; Google then confirms your identity and e-mail to us.</li>
        <li><strong>OpenStreetMap</strong> – map tiles are loaded from OpenStreetMap servers (which see your IP address), and coordinates/search terms are sent to the Nominatim service to look up place names.</li>
      </ul>
      <p>
        Some of these providers may process data outside the EU/EEA. Where that happens, transfers
        rely on the EU Commission’s standard contractual clauses or an adequacy decision.
      </p>
      <h2>Retention</h2>
      <p>
        Data is kept until you delete it. Deleting a sighting removes it and its photos; deleting
        your account (on “My page”) permanently removes your profile, all your sightings, photos
        and reports. Backups held by our providers are overwritten within their normal cycles.
      </p>
      <h2>Cookies and local storage</h2>
      <p>
        We only use strictly necessary cookies: to keep you signed in and to remember your
        language. No consent banner is needed for these, and we use no tracking cookies.
      </p>
      <h2>Your rights</h2>
      <p>
        You have the right to access, correct, delete, restrict and port your data, to object to
        processing based on legitimate interest, and to withdraw consent. You can edit or delete
        your sightings and account yourself on “My page”, or contact us at <Mail />. You may also
        lodge a complaint with your data protection authority – in Sweden, Integritetsskyddsmyndigheten
        (IMY).
      </p>
      <h2>Children</h2>
      <p>
        You must be at least 13 years old (or the age required in your country) to create an
        account. Please do not upload identifiable photos of children without their guardian’s
        consent.
      </p>
    </>
  );
}
