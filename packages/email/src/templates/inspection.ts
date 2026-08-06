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

// Confirmation the customer gets when we accept a befaring.
export function buildInspectionConfirmedEmail(
  brand: EmailBrand,
  inspection: InspectionEmailDetails,
): RenderedEmail {
  const cancelUrl = `${brand.siteUrl.replace(/\/$/, "")}/befaring/avbestill?token=${encodeURIComponent(inspection.cancelToken)}`;

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
