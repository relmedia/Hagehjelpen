# Hagehjelpen

Monorepo (Turborepo + pnpm) for Hagehjelpen – salg og installasjon av elektriske robotgressklippere.

## Struktur

- `apps/web` – Forsiden (Next.js App Router, Tailwind CSS v4, GSAP ScrollTrigger)
- `apps/dashboard` – Adminpanel (Next.js, shadcn/ui, Supabase). Se `apps/dashboard/README.md`

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
