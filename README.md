# Hagehjelpen

Monorepo (Turborepo + pnpm) for Hagehjelpen – salg og installasjon av elektriske robotgressklippere.

## Struktur

- `apps/web` – Forsiden (Next.js App Router, Tailwind CSS v4, GSAP ScrollTrigger)
- `apps/dashboard` – Adminpanel (Next.js, shadcn/ui, Supabase). Se `apps/dashboard/README.md`
- `packages/email` – Felles e-postmaler i Hagehjelpen-profilen, brukt av begge appene

## Kom i gang

```bash
pnpm install
pnpm dev
```

Forsiden kjører på [http://localhost:3000](http://localhost:3000), dashbordet på
[http://localhost:3001/studio](http://localhost:3001/studio).

## Kommandoer

| Kommando      | Beskrivelse                    |
| ------------- | ------------------------------ |
| `pnpm dev`    | Starter alle apper i dev-modus |
| `pnpm build`  | Bygger alle apper              |
| `pnpm lint`   | Linter alle apper              |

## Bilder av robotklipperne

Produktvelgeren på forsiden henter modellene fra Supabase (tabellen `mowers`).
Bildene kan komme to steder fra, og nettsiden bruker det første som finnes:

1. **Opplastet i dashbordet** – `/dashboard/klippere/<modell>` → feltet Bilde.
   Filen havner i storage-bucketen `media` og lagres som `image_url`.
2. **Filer i repoet** – legg offisielle produktbilder i
   `apps/web/public/klippere/` med filnavn lik modellens slug, for eksempel
   `automower-430v-nera.webp`. Gyldige formater: `.webp`, `.png`, `.jpg`.

Sluggene ligger i `apps/dashboard/supabase/seed-mowers.sql`:

```
automower-aspire-r6v     automower-305e-nera    automower-410ve-nera
automower-308v           automower-405ve-nera   automower-320-nera
automower-312v           automower-310e-nera    automower-430v-nera
```

Bruk Husqvarnas egne produktbilder fra forhandlerportalen – de er ryddet for
rettigheter og har transparent bakgrunn, som passer kortene. Kort uten bilde
viser bare tekst, så det er trygt å legge inn bildene etter hvert.

## E-post

Alle utgående e-poster bruker malene i `packages/email`, slik at forsiden og
dashbordet ser like ut. Resend-nøkkel, avsender og mottaker settes ett sted:
`/dashboard/innstillinger/e-post`.

Kontaktskjemaet på forsiden trenger `SUPABASE_SECRET_KEY` i `apps/web/.env.local`
for å lese det oppsettet og lagre henvendelsen under «Henvendelser». Mangler
nøkkelen, faller den tilbake på `RESEND_API_KEY`, `CONTACT_FROM` og `CONTACT_TO`
fra miljøvariabler – og uten dem igjen åpnes kundens egen e-postklient.

En innsending gir tre ting: en rad i `leads`, et varsel til oss med kundens
adresse som svaradresse og bildene som vedlegg, og en kvittering til kunden.

Logoen i toppen av malene hentes fra `NEXT_PUBLIC_SITE_URL` + `/logo-email.png`,
siden e-postklienter ikke viser SVG. Endrer du `public/logo.svg`, kjør
`pnpm --filter web generate:email-logo` for å lage PNG-en på nytt.

## Bestilling av befaring

Besøkende bestiller selv i befaringsseksjonen på forsiden. Kalenderen viser bare
dager administrator har åpnet under `/dashboard/ledige-dager`, minus timene som
allerede er bestilt og de som ligger nærmere enn to timer fram i tid.

Flyten går gjennom to ruter i `apps/web`:

- `GET /api/booking/slots` regner ut de ledige tidene. Den leser
  `availability_days` og `inspections` med tjenestenøkkelen, siden besøkende
  ikke har lov til å se andres bestillinger.
- `POST /api/booking` kjører robotsjekken, kontrollerer at tiden fortsatt er
  ledig og lagrer raden i `inspections` med status `pending`. Kunden får en
  kvittering med avbestillingslenke, og vi får et varsel.

Bekreftelsen sendes først når noen trykker «Bekreft» under `/dashboard/befaringer`.
Fram til da kan kunden avbestille selv på `/befaring/avbestill?token=…`.

To som bestiller samtidig stoppes av en unik indeks i databasen. Kjør
`apps/dashboard/supabase/booking.sql` én gang i Supabase for å legge den inn –
uten den kan to kunder få samme tidspunkt.

Bestillingen krever `SUPABASE_SECRET_KEY` i `apps/web/.env.local`. Mangler den,
viser seksjonen telefonnummer og kontaktskjema i stedet for kalenderen.

## Robotsjekk

Kontaktskjemaet og bestillingen beskyttes av Cloudflare Turnstile. Nøklene ligger i
`apps/web/.env.local` som `NEXT_PUBLIC_TURNSTILE_SITE_KEY` og `TURNSTILE_SECRET`,
og må også settes i Vercel for produksjon.

Domenelisten på widgeten må inneholde alle vertsnavnene den skal virke på –
`hagehjelpen.no`, `www.hagehjelpen.no`, og `localhost` og `127.0.0.1` for lokal
utvikling. Mangler et av dem, nekter widgeten å laste med feilkode 110200, og
da blir det aldri noe token å verifisere.

Nøklene hører sammen. Er ingen av dem satt, er robotsjekken av med vilje og
skjemaene virker som før. Er bare sitekeyen satt, avvises innsendinger: widgeten
vises til besøkende, men serveren kan ikke sjekke tokenet, og da ville skjemaet
stått åpent for roboter uten at det syntes noe sted. Lokalt kan Cloudflares
testnøkler brukes – de godkjenner alt og krever ingen domeneliste.

Verifiseringen ligger i `src/lib/turnstile.ts` og kalles fra `/api/contact` og
`/api/booking` før noe lagres eller sendes. Vil du sjekke at nøkkelen stemmer,
kan du kalle siteverify med et tulletoken: svaret
`invalid-input-response` betyr at nøkkelen er riktig, mens
`invalid-input-secret` betyr at den er feil.

## Samtykke til informasjonskapsler

Besøkende velger selv i banneret nederst på siden. Valget lagres i cookien
`hh-samtykke` i tolv måneder, og kan endres når som helst fra bunnteksten eller
personvernsiden på `/personvern`.

Det finnes én valgfri kategori, avslått til besøkende sier ja:

- **statistikk** – styrer trafikkmålingen i `src/lib/track.ts`. Uten samtykke
  sendes ingenting til `/api/track`, og øktnøklene skrives ikke til
  `sessionStorage`. Trekkes samtykket tilbake, slettes nøklene.

Nødvendig lagring (robotsjekken, verdiene skjemaet tar med seg fra
prisberegneren, og selve samtykket) kan ikke slås av og krever ikke samtykke.

Ingenting fra tredjepart lastes inn av seg selv. Flyfotoene fra Norkart og
adressesøket mot Kartverket hentes først når besøkende tar verktøyene i bruk.

Legges det inn en tjeneste som skal sperres bak samtykke, utvid
`ConsentCategories` i `src/lib/consent.ts`, les kategorien med `useConsent()`
fra `src/lib/use-consent.ts` i komponenten, og oppdater tabellen på
personvernsiden. Endres kategoriene, må `VERSION` i `src/lib/consent.ts` økes –
da blir alle spurt på nytt.
