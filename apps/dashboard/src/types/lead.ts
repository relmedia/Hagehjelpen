// A lead is an enquiry from the website: the contact form, the lawn calculator
// or a phone call logged manually.
export type LeadStatus = "ny" | "kontaktet" | "tilbud" | "vunnet" | "tapt";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  lawn_size: string | null;
  lawn_area: number | null;
  mower: string | null;
  address: string | null;
  message: string | null;
  image_count: number | null;
  source: string | null;
  status: LeadStatus;
  note: string | null;
  created_at: string;
  handled_at: string | null;
};

export const LEAD_STATUSES: LeadStatus[] = ["ny", "kontaktet", "tilbud", "vunnet", "tapt"];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  ny: "Ny",
  kontaktet: "Kontaktet",
  tilbud: "Tilbud sendt",
  vunnet: "Vunnet",
  tapt: "Tapt",
};

// Leads in these states are done with – they live on the archive page.
export const CLOSED_LEAD_STATUSES: LeadStatus[] = ["vunnet", "tapt"];

// Mirrors the option values the website's contact form posts.
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

export function serviceLabel(value: string | null): string {
  if (!value) return "—";
  return SERVICE_LABELS[value] ?? value;
}

export function lawnSizeLabel(value: string | null): string {
  if (!value) return "—";
  return LAWN_SIZE_LABELS[value] ?? value;
}

export function mowerLabel(value: string | null): string {
  if (!value) return "—";
  return MOWER_LABELS[value] ?? value;
}

export function sourceLabel(value: string | null): string {
  if (!value) return "Nettside";
  return LEAD_SOURCE_LABELS[value] ?? value;
}
