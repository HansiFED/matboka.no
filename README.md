# matboka.no

Nettsiden til Matboka-appen. Vanlige HTML-filer uten byggesteg, og ingen app-kode. Siden ligger på GitHub Pages.

## Hva som ligger her

| Fil | Hva |
| --- | --- |
| `index.html` | Forsiden |
| `hjelp.html` | Hjelp, på `matboka.no/hjelp` (støtteadressen i App Store) |
| `personvern.html` | Personvernerklæringen, samme tekst som i appen |
| `vilkar.html` | Vilkårene, samme tekst som i appen |
| `slett-konto.html` | Slik sletter man kontoen. Google Play krever en side på nett |
| `i.html` | Delte oppskrifter: `matboka.no/i#r=…` |
| `404.html` | Siden folk får når adressen ikke finnes |
| `.well-known/apple-app-site-association` | Lar iPhone og iPad åpne `matboka.no/i` i appen |
| `.well-known/assetlinks.json` | Det samme for Android |
| `CNAME` | Domenet, `matboka.no` |
| `.nojekyll` | Får GitHub til å publisere `.well-known` (mappenavn med punktum blir ellers borte) |
| `css/site.css` | Utseendet, med samme farger og skrift som appen |
| `js/site.js` | Butikklenkene |
| `js/oppskrift.js`, `js/lz-string.min.js` | Viser delte oppskrifter |
| `fonts/` | Plus Jakarta Sans, lagt her så siden ikke kaller Google |
| `img/` | Ikoner, skjermbilder av appen og matbilder |

Sidene lenker til hverandre uten `.html` (`/hjelp`). GitHub Pages finner `hjelp.html` selv. Vil du se siden lokalt, kjør `npx serve` i mappa, som gjør det samme.

## Publiser

1. **GitHub Desktop:** File → Add Local Repository → velg mappa `matboka.no`. GitHub Desktop sier at mappa ikke er et repo ennå; trykk «create a repository». La «Initialize this repository with a README» være av (README finnes), velg None for Git ignore og License, og trykk Create Repository. Så Publish repository, og fjern haken for «Keep this code private». Pages er gratis bare for offentlige repoer.
2. **Pages:** på github.com, repoet → Settings → Pages. Under «Build and deployment»: Source «Deploy from a branch», branch `main` og mappa `/ (root)`. Save.
3. **Domenet:** samme side, «Custom domain»: `matboka.no` (det står alt i `CNAME`). Save. Når GitHub har laget sertifikatet, huker du av «Enforce HTTPS».
4. **Anbefalt:** bekreft domenet på kontoen din, så ingen andre kan bruke det på GitHub: innstillingene for kontoen din (ikke repoet) → Pages → Add a domain, og legg inn TXT-posten GitHub viser.

### DNS hos den som har domenet

| Type | Navn | Verdi |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `hansifed.github.io` |

Fjern andre A- og AAAA-poster for `@`, for eksempel en parkeringsside fra registraren. `www.matboka.no` sendes videre til `matboka.no`. E-postposter (MX, og TXT for Resend) påvirkes ikke.

## Før lansering

- **Butikklenkene** i `js/site.js`. Til de er fylt inn, står det «Kommer snart» på siden.
- **Android:** bytt `SETT_INN_SHA256_FRA_PLAY_CONSOLE` i `.well-known/assetlinks.json` med SHA-256-fingeravtrykket til app-signeringsnøkkelen: Play Console → Test og utgivelse → Appintegritet → Appsignering. Bygg du installerer på andre måter, er signert med en annen nøkkel; legg til fingeravtrykket for den også hvis lenkene skal åpne appen der.
- **iPhone (valgfritt):** et banner øverst i Safari som åpner App Store. Legg `<meta name="apple-itunes-app" content="app-id=TALLENE">` i `<head>` på `index.html` og `i.html`.

## Sjekk at lenkene åpner appen

- `https://matboka.no/.well-known/apple-app-site-association` skal vise JSON med `A3C83CPJ37.no.matboka.app`.
- Apple henter filen innen et døgn. Det Apple har lagret, ser du på `https://app-site-association.cdn-apple.com/a/v1/matboka.no`.
- Android: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://matboka.no&relation=delegate_permission/common.handle_all_urls`
- På iPhone med et nytt bygg av appen: send en delt oppskrift til deg selv i Meldinger og trykk på lenken. Den skal åpnes i Matboka.
- Universelle lenker tåler ikke videresending. Appen bruker `matboka.no` uten www, så la ikke `matboka.no` sende videre til `www`.

## Bli funnet i Google

Når siden er ute:

1. **Google Search Console** (search.google.com/search-console): Legg til eiendom → Domene → `matboka.no`, og legg TXT-posten Google viser inn hos DNS-leverandøren.
2. **Nettstedskart:** send inn `https://matboka.no/sitemap.xml` under Sitemaps.
3. **Forsiden:** URL-inspeksjon → `https://matboka.no/` → Be om indeksering.
4. **Bing:** Bing Webmaster Tools kan hente alt fra Search Console.
5. **Lenker inn:** sett `https://matboka.no` som nettsted i App Store Connect og Google Play, og lenk fra de andre sidene dine. En ny side rangerer først og fremst på lenker og navnet.

Forsiden har strukturerte data (JSON-LD) med navnet på nettstedet og appen. Når appen har vurderinger i butikkene, kan de legges til som `aggregateRating`, men bare med ekte tall.

## Når noe endres i appen

- **Personvern eller vilkår:** teksten står både her og i appen (`src/app/personvern.tsx` og `src/app/vilkar.tsx`). Endre begge, og datoen øverst.
- **Delingsformatet:** `js/oppskrift.js` leser versjon 1 av formatet i `src/lib/share/link.ts` (beskrevet øverst i filen). Lager appen en ny versjon, må den oppdateres.
- **Prisen på Pluss** står på forsiden og i hjelp.
- **Skjermbildene** i `img/screens` er tatt av appen med demodata (390 × 844 punkter, i 1x og 2x).

## Lisenser

- Plus Jakarta Sans: SIL Open Font License (`fonts/OFL.txt`).
- lz-string: MIT (står øverst i `js/lz-string.min.js`).
- Ikonene under «Lagre fra hvor som helst» følger Lucide (ISC).
- Matbildene er fra Pexels: gratis til kommersiell bruk, uten krav om kreditering.
