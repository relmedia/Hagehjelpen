import { LAWN_SIZE_LABELS, MOWER_LABELS, SERVICE_LABELS } from "../labels";
import {
  type EmailBrand,
  type EmailDetailRow,
  type EmailOptions,
  type RenderedEmail,
  renderEmail,
  renderEmailText,
} from "../render";

export type LeadEmailDetails = {
  name: string;
  email: string;
  phone: string;
  service: string;
  lawnSize?: string | null;
  mower?: string | null;
  message?: string | null;
  imageCount?: number;
};

function serviceLabel(value: string): string {
  return SERVICE_LABELS[value] ?? value;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function optional(value: string | null | undefined, labels: Record<string, string>): string | null {
  const key = value?.trim();
  if (!key) return null;
  return labels[key] ?? key;
}

// What we send ourselves when someone submits the contact form.
export function buildLeadNotificationEmail(
  brand: EmailBrand,
  lead: LeadEmailDetails,
): RenderedEmail {
  const rows: EmailDetailRow[] = [
    { label: "Navn", value: lead.name },
    { label: "Telefon", value: lead.phone },
    { label: "E-post", value: lead.email },
    { label: "Tjeneste", value: serviceLabel(lead.service) },
  ];

  const lawn = optional(lead.lawnSize, LAWN_SIZE_LABELS);
  if (lawn) rows.push({ label: "Plenstørrelse", value: lawn });

  const mower = optional(lead.mower, MOWER_LABELS);
  if (mower) rows.push({ label: "Robotgressklipper", value: mower });

  if (lead.imageCount) {
    rows.push({
      label: "Bilder",
      value: `${lead.imageCount} bilde${lead.imageCount === 1 ? "" : "r"} lagt ved`,
    });
  }

  const options: EmailOptions = {
    ...brand,
    preheader: `${lead.name} – ${serviceLabel(lead.service)}`,
    badge: { label: "Ny henvendelse", tone: "info" },
    heading: `Ny henvendelse fra ${lead.name}`,
    intro: ["Svar på denne e-posten for å gå rett i dialog med kunden."],
    detailTitle: "Kontaktinformasjon",
    detailRows: rows,
    outro: lead.message?.trim() ? [`Melding fra kunden:\n\n${lead.message.trim()}`] : [],
    signoff: false,
  };

  return {
    subject: `Ny henvendelse: ${serviceLabel(lead.service)} – ${lead.name}`,
    html: renderEmail(options),
    text: renderEmailText(options),
  };
}

// Receipt the customer gets straight away, so they know we got it.
export function buildLeadReceiptEmail(brand: EmailBrand, lead: LeadEmailDetails): RenderedEmail {
  const rows: EmailDetailRow[] = [{ label: "Tjeneste", value: serviceLabel(lead.service) }];

  const lawn = optional(lead.lawnSize, LAWN_SIZE_LABELS);
  if (lawn) rows.push({ label: "Plenstørrelse", value: lawn });

  const mower = optional(lead.mower, MOWER_LABELS);
  if (mower) rows.push({ label: "Robotgressklipper", value: mower });

  if (lead.message?.trim()) rows.push({ label: "Din melding", value: lead.message.trim() });

  const options: EmailOptions = {
    ...brand,
    preheader: "Vi har mottatt henvendelsen din og tar kontakt innen 24 timer.",
    badge: { label: "Mottatt", tone: "success" },
    heading: `Takk for henvendelsen, ${firstName(lead.name)}!`,
    intro: [
      "Vi har mottatt meldingen din og tar kontakt innen 24 timer på telefon eller e-post.",
      "Haster det, er det bare å ringe oss direkte.",
    ],
    detailTitle: "Dette registrerte vi",
    detailRows: rows,
    outro: ["Er noe feil, eller vil du legge til flere detaljer? Svar på denne e-posten."],
  };

  return {
    subject: `Vi har mottatt henvendelsen din – ${brand.siteName}`,
    html: renderEmail(options),
    text: renderEmailText(options),
  };
}
