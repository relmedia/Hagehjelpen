# Hagehjelpen

Monorepo (Turborepo + pnpm) for Hagehjelpen – salg og installasjon av elektriske robotgressklippere.

## Struktur

- `apps/web` – Forsiden (Next.js App Router, Tailwind CSS v4, GSAP ScrollTrigger)
- `apps/dashboard` – Kommer senere

## Kom i gang

```bash
pnpm install
pnpm dev
```

Forsiden kjører på [http://localhost:3000](http://localhost:3000).

## Kommandoer

| Kommando      | Beskrivelse                    |
| ------------- | ------------------------------ |
| `pnpm dev`    | Starter alle apper i dev-modus |
| `pnpm build`  | Bygger alle apper              |
| `pnpm lint`   | Linter alle apper              |
