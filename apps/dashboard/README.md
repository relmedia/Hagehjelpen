# Hagehjelpen – administrasjonspanel

Admin for hagehjelpen.no: henvendelser, befaringer og alt innholdet nettsiden viser.
Bygget på Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui og Supabase.

## Kom i gang

```bash
pnpm install
pnpm --filter dashboard dev   # http://localhost:3001
```

Nettsiden (`apps/web`) kjører på port 3000, dashbordet på 3001.

### Miljøvariabler (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=          # Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=   # publishable/anon-nøkkel
SUPABASE_SECRET_KEY=               # secret/service_role-nøkkel, kun server
NEXT_PUBLIC_SITE_URL=https://hagehjelpen.no
```

### Database

1. Kjør `supabase/schema.sql` i Supabase SQL-editoren. Den lager tabellene under
   og skrur på row level security: innhold kan leses anonymt av nettsiden, mens
   henvendelser og befaringer kun kan leses av innloggede brukere.
2. Lag en bruker under **Authentication → Users → Add user** (panelet har ingen
   registrering – brukere opprettes manuelt).
3. Lag et **public** storage-bucket som heter `media`. Bildeopplasting i
   innholdsskjemaene legger filene i `media/uploads`.
4. Kjør `supabase/seed-mowers.sql`, `supabase/seed-price-tiers.sql`,
   `supabase/seed-coverage-areas.sql`, `supabase/seed-testimonials.sql` og
   `supabase/seed-faq-items.sql` for å legge inn robotklipperne, prisnivåene,
   dekningsområdene, omtalene og spørsmålene som allerede ligger på forsiden.
   Alle kan kjøres flere ganger. Bilde per modell laster du opp i
   `/dashboard/klippere/<id>`.

### Trafikkstatistikk

Kjør `supabase/analytics.sql`. Den lager tabellen `page_views` og funksjonene
dashbordet leser (`analytics_summary`, `analytics_daily`, `analytics_sections`,
`analytics_actions`, `analytics_referrers`, `analytics_realtime`,
`analytics_countries` og `analytics_cities`). Filen kan kjøres på nytt når som
helst – den legger til det som mangler. Uten den viser kortene nuller, og
årsaken logges i serverloggen; resten av panelet fungerer som normalt.

Nettsiden er én lang forside, så «mest besøkte sider» ville alltid vist `/`.
I stedet måler vi to ting til: hvilke seksjoner besøkende faktisk kommer ned til
(`analytics_sections`, ankrene i `SECTION_ORDER`) og hvilke verktøy de bruker
(`analytics_actions` – prisberegner, plenoppmåling, dekningssjekk,
produktvelger, skjema sendt, telefon trykket). Begge telles én gang per økt.
Norske navn på seksjoner og handlinger ligger i `src/lib/analytics-shared.ts`;
legger du til en ny seksjon på nettsiden, legg ankeret inn der.

Tallene samles inn av nettsiden selv: `apps/web` sender én sidevisning per rute
til `/api/track`, ett signal når besøkende har vært på siden i 10 sekunder, og
ett per seksjon og verktøy (`src/lib/track.ts`).
Det brukes ingen informasjonskapsler – besøkende identifiseres med en hash av
IP, nettleser og dato som byttes hvert døgn. Land og by kommer fra Vercel sine
geo-headere og er derfor tomme lokalt. Sett `ANALYTICS_SALT` i `apps/web` i
produksjon.

## Ruter

| Rute | Innhold | Tabell |
| --- | --- | --- |
| `/studio` | Innlogging (Supabase Auth) | – |
| `/dashboard` | Trafikk, henvendelser og nøkkeltall | analytics-RPC + `leads` |
| `/dashboard/henvendelser` + `/arkiv` | Forespørsler fra skjema og kalkulator, med status og internt notat | `leads` |
| `/dashboard/befaringer` + `/historikk` | Bestilte befaringer, bekreft eller avbestill | `inspections` |
| `/dashboard/ledige-dager` + `/historikk` | Dager og klokkeslett åpne for befaring | `availability_days` |
| `/dashboard/tjenester` | Installasjon, befaring, service | `services` |
| `/dashboard/klippere` | Robotklippere med maks areal og helling | `mowers` |
| `/dashboard/priser` | Prisnivåer for installasjon | `price_tiers` |
| `/dashboard/dekning` | Postnummer og soner for dekningssjekken | `coverage_areas` |
| `/dashboard/omtaler` | Kundeomtaler | `testimonials` |
| `/dashboard/sporsmal` | Spørsmål og svar (FAQ) | `faq_items` |
| `/dashboard/artikler` | Artikler / blogg | `articles` |
| `/dashboard/sider` | Frittstående sider | `pages` |
| `/dashboard/innstillinger` + `/e-post` | Nettstedsinnstillinger og Resend | `settings`, `email_settings` |
| `/dashboard/account` | Egen profil og passord | Supabase Auth |

Menyen defineres i `src/navigation/sidebar/sidebar-items.ts`. Tallene ved
«Henvendelser» og «Befaringer» kommer fra `getSidebarCounts()` i
`src/lib/bookings.ts` og kobles på i `src/app/(main)/dashboard/layout.tsx`.

## Struktur

Kolokalisering: hver rute eier sine egne `_components`. Delt kode ligger på toppnivå.

```
src/
  app/(main)/dashboard/<rute>/     side, [id]-side og _components
  components/ui/                   shadcn-komponenter
  lib/                             datalesing (content, leads, bookings), e-post, Supabase
  server/                          server actions (content, booking, lead)
  types/                           content, booking, lead
  navigation/sidebar/              menyen
supabase/schema.sql                tabeller og RLS
supabase/analytics.sql             page_views + funksjonene bak trafikkortene
supabase/seed-mowers.sql           robotklipperne fra forsiden
supabase/seed-price-tiers.sql      prisnivåene fra forsiden
supabase/seed-coverage-areas.sql   dekningsområdene fra forsiden
supabase/seed-testimonials.sql     kundeomtalene fra forsiden
supabase/seed-faq-items.sql        spørsmål og svar fra forsiden
```

## E-post

Transaksjonell e-post sendes via Resend med maler i `src/lib/email.ts`.
API-nøkkel og avsender settes i `/dashboard/innstillinger/e-post`, der du også
kan sende en testmelding.
