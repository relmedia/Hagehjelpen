import {
  type EmailBrand,
  type EmailOptions,
  type RenderedEmail,
  renderEmail,
  renderEmailText,
} from "../render";

export type InspectionEmailDetails = {
  firstName: string;
  serviceLabel: string;
  dateLabel: string;
  time: string;
  address?: string | null;
  message?: string | null;
  cancelToken: string;
};

/** Alt vi trenger for varselet til oss selv når noen bestiller på nettsiden. */
export type InspectionNotificationDetails = {
  name: string;
  email: string;
  phone: string;
  dateLabel: string;
  time: string;
  address?: string | null;
  postalCode?: string | null;
  lawnArea?: number | null;
  message?: string | null;
};

function cancelUrlFor(brand: EmailBrand, cancelToken: string): string {
  return `${brand.siteUrl.replace(/\/$/, "")}/befaring/avbestill?token=${encodeURIComponent(cancelToken)}`;
}

// Confirmation the customer gets when we accept a befaring.
export function buildInspectionConfirmedEmail(
  brand: EmailBrand,
  inspection: InspectionEmailDetails,
): RenderedEmail {
  const cancelUrl = cancelUrlFor(brand, inspection.cancelToken);

  const options: EmailOptions = {
    ...brand,
    preheader: `Befaringen din er bekreftet ${inspection.dateLabel} kl. ${inspection.time}.`,
    badge: { label: "Bekreftet", tone: "success" },
    heading: `Hei ${inspection.firstName}, befaringen er bekreftet`,
    intro: [
      "Vi har satt av tid til å komme ut, måle opp plenen og planlegge installasjonen sammen med deg.",
      "Trenger du å endre tidspunktet, svar på denne e-posten eller ring oss.",
    ],
    detailTitle: "Din befaring",
    detailRows: [
      { label: "Tjeneste", value: inspection.serviceLabel },
      { label: "Dato", value: inspection.dateLabel },
      { label: "Klokkeslett", value: inspection.time },
      ...(inspection.address ? [{ label: "Adresse", value: inspection.address }] : []),
      ...(inspection.message?.trim() ? [{ label: "Din melding", value: inspection.message.trim() }] : []),
    ],
    cta: { label: "Avbestill befaringen", url: cancelUrl },
    outro: ["Sørg for at hunder er inne og at porten er åpen, så går befaringen raskt."],
  };

  return {
    subject: `Befaring bekreftet – ${inspection.dateLabel} kl. ${inspection.time}`,
    html: renderEmail(options),
    text: renderEmailText(options),
  };
}

/** Kvitteringen kunden får med én gang tiden er reservert på nettsiden. Selve
 *  bekreftelsen kommer først når vi har sett over bestillingen. */
export function buildInspectionReceivedEmail(
  brand: EmailBrand,
  inspection: InspectionEmailDetails,
): RenderedEmail {
  const options: EmailOptions = {
    ...brand,
    preheader: `Vi har reservert ${inspection.dateLabel} kl. ${inspection.time} til deg.`,
    badge: { label: "Mottatt", tone: "info" },
    heading: `Takk, ${inspection.firstName}! Tiden er reservert`,
    intro: [
      "Vi har satt av tidspunktet til deg og ser over bestillingen. Du får en egen e-post så snart befaringen er bekreftet – vanligvis innen 24 timer.",
      "Passer det likevel ikke, kan du avbestille med knappen under.",
    ],
    detailTitle: "Bestillingen din",
    detailRows: [
      { label: "Tjeneste", value: inspection.serviceLabel },
      { label: "Dato", value: inspection.dateLabel },
      { label: "Klokkeslett", value: inspection.time },
      ...(inspection.address ? [{ label: "Adresse", value: inspection.address }] : []),
      ...(inspection.message?.trim() ? [{ label: "Din melding", value: inspection.message.trim() }] : []),
    ],
    cta: { label: "Avbestill befaringen", url: cancelUrlFor(brand, inspection.cancelToken) },
    outro: ["Har du spørsmål i mellomtiden, er det bare å svare på denne e-posten."],
  };

  return {
    subject: `Vi har mottatt bestillingen – ${inspection.dateLabel} kl. ${inspection.time}`,
    html: renderEmail(options),
    text: renderEmailText(options),
  };
}

/** Varselet til oss når en befaring bestilles på nettsiden. */
export function buildInspectionNotificationEmail(
  brand: EmailBrand,
  inspection: InspectionNotificationDetails,
): RenderedEmail {
  const options: EmailOptions = {
    ...brand,
    preheader: `${inspection.name} har bestilt befaring ${inspection.dateLabel} kl. ${inspection.time}.`,
    badge: { label: "Ny bestilling", tone: "info" },
    heading: "Ny befaring bestilt på nettsiden",
    intro: ["Tidspunktet er reservert. Bekreft bestillingen i dashbordet, så får kunden e-post om det."],
    detailTitle: "Befaringen",
    detailRows: [
      { label: "Dato", value: inspection.dateLabel },
      { label: "Klokkeslett", value: inspection.time },
      { label: "Navn", value: inspection.name },
      { label: "Telefon", value: inspection.phone },
      { label: "E-post", value: inspection.email },
      ...(inspection.address
        ? [
            {
              label: "Adresse",
              value: [inspection.address, inspection.postalCode].filter(Boolean).join(", "),
            },
          ]
        : []),
      ...(inspection.lawnArea ? [{ label: "Plenareal", value: `${inspection.lawnArea} m²` }] : []),
      ...(inspection.message?.trim() ? [{ label: "Melding", value: inspection.message.trim() }] : []),
    ],
    signoff: false,
  };

  return {
    subject: `Ny befaring: ${inspection.dateLabel} kl. ${inspection.time} – ${inspection.name}`,
    html: renderEmail(options),
    text: renderEmailText(options),
  };
}
