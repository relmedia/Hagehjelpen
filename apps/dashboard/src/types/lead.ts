import {
  LAWN_SIZE_LABELS,
  LEAD_SOURCE_LABELS,
  MOWER_LABELS,
  SERVICE_LABELS,
} from "@repo/email/labels";

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

// Shared with the website so both ends label the form values identically.
export { LAWN_SIZE_LABELS, LEAD_SOURCE_LABELS, MOWER_LABELS, SERVICE_LABELS };

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
