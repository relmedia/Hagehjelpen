// Mirrors the option values the website's contact form posts. Shared so the
// dashboard, the e-mail templates and the API route always agree on wording.

export const SERVICE_LABELS: Record<string, string> = {
  installasjon: "Installasjon av robotgressklipper",
  befaring: "Befaring av hagen",
  feilsoking: "Feilsøking / service",
  usikker: "Usikker – trenger rådgivning",
};

export const LAWN_SIZE_LABELS: Record<string, string> = {
  "0-1000": "0–1000 m²",
  "1000-2000": "1000–2000 m²",
  "2000-plus": "2000 m² og oppover",
  ukjent: "Vet ikke",
};

export const MOWER_LABELS: Record<string, string> = {
  husqvarna: "Husqvarna Automower",
  gardena: "Gardena",
  worx: "Worx Landroid",
  ambrogio: "Ambrogio",
  segway: "Segway Navimow",
  annet: "Annet / vet ikke",
  ingen: "Har ikke robotgressklipper ennå",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  kontaktskjema: "Kontaktskjema",
  kalkulator: "Plenkalkulator",
  telefon: "Telefon",
  befaring: "Befaringsskjema",
};
