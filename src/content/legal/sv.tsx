import Link from "next/link";

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com";
const Mail = () => <a href={`mailto:${contact}`}>{contact}</a>;

export const updated = "2026-10-03";

export function About() {
  return (
    <>
      <p>
        HatSpotted är en icke-kommersiell community där fans delar observationer av den berömda
        röd- och vitrandiga hatten – på maskerader, läsdagar i skolan, parader, i skyltfönster eller
        var den än dyker upp. Ta en bild, sätt ut den på kartan och se var i världen hatten har
        synts.
      </p>
      <h2>Ett fanprojekt – ingen koppling</h2>
      <p>
        <strong>
          HatSpotted är ett fristående fanprojekt. Det har ingen koppling till, och är varken
          godkänt eller sponsrat av, Dr. Seuss Enterprises, L.P. eller någon annan rättighetshavare.
        </strong>{" "}
        Alla varumärken och figurer tillhör sina respektive ägare. Vi använder inga officiella
        bilder, logotyper, typsnitt eller figurer; vår hattlogga är en egen illustration.
      </p>
      <h2>Så funkar det</h2>
      <ul>
        <li>Alla kan titta på kartan och flödet – inget konto behövs.</li>
        <li>För att lägga upp en observation loggar du in med Google eller en inloggningslänk via e-post.</li>
        <li>Bara ditt valda visningsnamn syns offentligt – aldrig din e-postadress.</li>
        <li>Platsdata (EXIF/GPS) tas bort från alla bilder innan de sparas.</li>
        <li>Ser du något som inte hör hemma här? Använd knappen ”Anmäl” på observationen.</li>
      </ul>
      <h2>Kontakt</h2>
      <p>
        Frågor, begäran om borttagning eller feedback: <Mail />.
      </p>
    </>
  );
}

export function Terms() {
  return (
    <>
      <p>
        Genom att använda HatSpotted (”webbplatsen”, ”vi”) godkänner du dessa villkor. Om du inte
        godkänner dem, använd inte webbplatsen.
      </p>
      <h2>1. Ett icke-kommersiellt fanprojekt</h2>
      <p>
        HatSpotted är ett gratis, icke-kommersiellt fanprojekt utan koppling till Dr. Seuss
        Enterprises, L.P. eller någon annan rättighetshavare. Webbplatsen tillhandahålls ”i befintligt
        skick” utan garantier och kan ändras eller stängas när som helst.
      </p>
      <h2>2. Konton</h2>
      <p>
        Du behöver ett konto för att lägga upp eller anmäla observationer. Du måste vara minst 13 år
        (eller äldre om det krävs där du bor). Ditt visningsnamn får inte utge sig för att vara
        någon annan eller vara stötande. Du ansvarar för aktiviteten på ditt konto.
      </p>
      <h2>3. Ditt innehåll</h2>
      <ul>
        <li>Du får bara ladda upp bilder som du själv har tagit.</li>
        <li>
          Ladda inte upp bilder där personer kan identifieras utan deras samtycke, och aldrig
          identifierbara bilder på barn utan vårdnadshavares samtycke.
        </li>
        <li>
          Ladda inte upp något olagligt, hatiskt, våldsamt, sexuellt, trakasserande eller som
          gör intrång i någon annans rättigheter, och avslöja inte privata adresser eller andra
          personuppgifter.
        </li>
        <li>
          Tänk efter innan du sätter ut en plats: den visas offentligt. Undvik att markera ditt
          eget eller någon annans hem.
        </li>
      </ul>
      <h2>4. Tillstånd att visa</h2>
      <p>
        Du behåller upphovsrätten till dina bilder. När du publicerar en observation intygar du att
        du själv tagit bilden och ger HatSpotted ett kostnadsfritt, icke-exklusivt och världsomfattande
        tillstånd att lagra, ändra storlek på och visa den (tillsammans med ditt visningsnamn,
        beskrivning, tid och plats) på webbplatsen och i förhandsvisningar vid delning. Tillståndet
        upphör när du raderar observationen eller ditt konto, med undantag för kortlivade
        säkerhetskopior och kopior som andra redan kan ha delat.
      </p>
      <h2>5. Moderering</h2>
      <p>
        Vi kan dölja eller ta bort innehåll och stänga av konton som bryter mot villkoren, efter eget
        omdöme och utan förvarning. Uppladdningar är begränsade för att förhindra missbruk.
        Rättighetshavare kan begära borttagning via <Mail />.
      </p>
      <h2>6. Ansvar</h2>
      <p>
        Innehållet publiceras av användare och speglar inte våra åsikter. I den utsträckning lagen
        tillåter ansvarar vi inte för förluster som uppstår av användningen av webbplatsen. Inget i
        villkoren begränsar dina rättigheter enligt tvingande konsumentlagstiftning.
      </p>
      <h2>7. Ändringar och tillämplig lag</h2>
      <p>
        Vi kan uppdatera villkoren; datumet nedan visar senaste versionen. Större ändringar meddelas
        på webbplatsen. Svensk lag gäller, utan att det påverkar tvingande skydd i ditt hemland.
      </p>
      <p>
        Se även vår <Link href="/privacy">integritetspolicy</Link>. Kontakt: <Mail />.
      </p>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <p>
        Den här policyn beskriver vilka personuppgifter HatSpotted behandlar, varför, och vilka
        rättigheter du har enligt dataskyddsförordningen (GDPR). Vi samlar in så lite som möjligt.
      </p>
      <h2>Personuppgiftsansvarig</h2>
      <p>
        HatSpotted drivs som ett privat, icke-kommersiellt fanprojekt. Kontakt i alla
        integritetsfrågor: <Mail />.
      </p>
      <h2>Vad vi sparar</h2>
      <ul>
        <li>
          <strong>Konto:</strong> e-postadress, visningsnamn, föredraget språk, roll
          (användare/admin), när kontot skapades och i förekommande fall när det stängdes av.
          Din e-postadress visas aldrig offentligt.
        </li>
        <li>
          <strong>Observationer:</strong> bilden, platsen du valt (latitud/longitud samt stad och
          land som härleds från den), tidpunkt för observationen, din beskrivning, när den
          publicerades och när du gav samtycke till att bilden visas.
        </li>
        <li>
          <strong>Anmälningar:</strong> vilken observation du anmälde, orsak och när.
        </li>
        <li>
          <strong>Teknisk data:</strong> vår inloggningsleverantör sparar inloggningsloggar (t.ex.
          IP-adress och tid) av säkerhetsskäl. Vi använder ingen analys- eller annonsspårning.
        </li>
      </ul>
      <p>
        Bilder kodas om vid uppladdning och <strong>all inbäddad metadata (EXIF), inklusive
        GPS-koordinater och kamerainformation, tas bort</strong> innan de sparas. Endast platsen du
        själv väljer på kartan publiceras.
      </p>
      <h2>Varför, och rättslig grund</h2>
      <ul>
        <li>Tillhandahålla ditt konto och publicera dina observationer – fullgörande av avtal med dig (art. 6.1 b).</li>
        <li>Visa din bild – ditt samtycke, som du ger med kryssrutan när du publicerar (art. 6.1 a). Du kan när som helst återkalla det genom att radera observationen.</li>
        <li>Moderering, förebyggande av missbruk och säkerhet (anmälningar, avstängningar, begränsningar, loggar) – vårt berättigade intresse av en trygg webbplats (art. 6.1 f).</li>
      </ul>
      <h2>Vilka mer som behandlar uppgifter</h2>
      <ul>
        <li><strong>Supabase</strong> – databas, inloggning och bildlagring (personuppgiftsbiträde).</li>
        <li><strong>Vår webbhotellsleverantör</strong> – kör webbplatsen och tar emot vanlig anropsdata som IP-adresser.</li>
        <li><strong>Google</strong> – bara om du väljer ”Fortsätt med Google”; Google bekräftar då din identitet och e-post till oss.</li>
        <li><strong>OpenStreetMap</strong> – kartbilder hämtas från OpenStreetMaps servrar (som ser din IP-adress), och koordinater/sökord skickas till tjänsten Nominatim för att slå upp ortnamn.</li>
      </ul>
      <p>
        Vissa av dessa leverantörer kan behandla uppgifter utanför EU/EES. I så fall sker
        överföringen med stöd av EU-kommissionens standardavtalsklausuler eller ett beslut om adekvat
        skyddsnivå.
      </p>
      <h2>Lagringstid</h2>
      <p>
        Uppgifterna sparas tills du raderar dem. När du raderar en observation tas den och dess
        bilder bort; när du raderar ditt konto (på ”Min sida”) tas din profil, alla dina
        observationer, bilder och anmälningar bort permanent. Säkerhetskopior hos våra leverantörer
        skrivs över enligt deras normala rutiner.
      </p>
      <h2>Cookies och lokal lagring</h2>
      <p>
        Vi använder bara nödvändiga cookies: för att hålla dig inloggad och komma ihåg ditt språk.
        Dessa kräver inget samtycke, och vi använder inga spårningscookies.
      </p>
      <h2>Dina rättigheter</h2>
      <p>
        Du har rätt att få tillgång till, rätta, radera, begränsa och flytta dina uppgifter, att
        invända mot behandling som grundas på berättigat intresse samt att återkalla samtycke. Du
        kan själv redigera eller radera observationer och konto på ”Min sida”, eller kontakta oss på{" "}
        <Mail />. Du kan också klaga hos Integritetsskyddsmyndigheten (IMY) eller
        dataskyddsmyndigheten i ditt land.
      </p>
      <h2>Barn</h2>
      <p>
        Du måste vara minst 13 år (eller den ålder som krävs i ditt land) för att skapa ett konto.
        Ladda inte upp identifierbara bilder på barn utan vårdnadshavares samtycke.
      </p>
    </>
  );
}
