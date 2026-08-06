import { NextResponse } from "next/server";

import {
  buildLeadNotificationEmail,
  buildLeadReceiptEmail,
  LAWN_SIZE_LABELS,
  MOWER_LABELS,
  SERVICE_LABELS,
  type LeadEmailDetails,
} from "@repo/email";

import { saveLead } from "@/lib/leads";
import { getMailContext, type MailAttachment, sendEmail } from "@/lib/mail";

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  lawnSize: string;
  mower: string;
  message: string;
};

const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function label(labels: Record<string, string>, value: string) {
  return labels[value] || value || "Ikke oppgitt";
}

// Brukes bare når Resend ikke er satt opp: da åpner vi kundens e-postklient.
function buildMailtoBody(data: ContactPayload, imageNote: string) {
  return [
    "Ny henvendelse fra hagehjelpen.no",
    "",
    `Navn: ${data.name}`,
    `E-post: ${data.email}`,
    `Telefon: ${data.phone}`,
    "",
    `Tjeneste: ${label(SERVICE_LABELS, data.service)}`,
    `Plenstørrelse: ${label(LAWN_SIZE_LABELS, data.lawnSize)}`,
    `Robotgressklipper: ${label(MOWER_LABELS, data.mower)}`,
    ...(imageNote ? ["", imageNote] : []),
    "",
    "Melding:",
    data.message || "Ingen melding",
  ].join("\n");
}

async function readRequest(
  request: Request,
): Promise<{ fields: Partial<ContactPayload>; images: File[] }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return { fields: await request.json(), images: [] };
  }

  const form = await request.formData();
  const read = (key: keyof ContactPayload) => {
    const value = form.get(key);
    return typeof value === "string" ? value : undefined;
  };

  const images = form
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File)
    .filter((file) => file.size > 0 && file.type.startsWith("image/"))
    .slice(0, MAX_FILES);

  return {
    fields: {
      name: read("name"),
      email: read("email"),
      phone: read("phone"),
      service: read("service"),
      lawnSize: read("lawnSize"),
      mower: read("mower"),
      message: read("message"),
    },
    images,
  };
}

async function toAttachments(images: File[]): Promise<MailAttachment[]> {
  return Promise.all(
    images.map(async (file, index) => ({
      filename: file.name || `hagebilde-${index + 1}.jpg`,
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })),
  );
}

export async function POST(request: Request) {
  let fields: Partial<ContactPayload>;
  let images: File[];

  try {
    ({ fields, images } = await readRequest(request));
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const data: ContactPayload = {
    name: fields.name?.trim() ?? "",
    email: fields.email?.trim() ?? "",
    phone: fields.phone?.trim() ?? "",
    service: fields.service ?? "",
    lawnSize: fields.lawnSize ?? "",
    mower: fields.mower ?? "",
    message: fields.message?.trim() ?? "",
  };

  // Ved befaring kartlegger vi plen og modell på stedet.
  const detailsRequired = data.service !== "befaring";

  if (
    !data.name ||
    !data.email ||
    !data.phone ||
    !data.service ||
    (detailsRequired && (!data.lawnSize || !data.mower))
  ) {
    return NextResponse.json(
      { error: "Fyll ut alle obligatoriske felt." },
      { status: 400 },
    );
  }

  if (!isValidEmail(data.email)) {
    return NextResponse.json({ error: "Ugyldig e-postadresse." }, { status: 400 });
  }

  if (images.some((file) => file.size > MAX_FILE_SIZE)) {
    return NextResponse.json(
      { error: "Hvert bilde må være mindre enn 5 MB." },
      { status: 413 },
    );
  }

  const lead: LeadEmailDetails = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    service: data.service,
    lawnSize: data.lawnSize,
    mower: data.mower,
    message: data.message,
    imageCount: images.length,
  };

  const { config, brand } = await getMailContext();

  // Henvendelsen skal ligge i dashbordet uansett hvordan e-posten går.
  await saveLead({ ...lead, source: "kontaktskjema" });

  if (!config) {
    const mailtoNote =
      images.length > 0
        ? `Jeg har ${images.length} bilde(r) av hagen – husk å legge dem ved denne e-posten.`
        : "";
    const mailto = `mailto:post@hagehjelpen.no?subject=${encodeURIComponent(
      `Henvendelse: ${label(SERVICE_LABELS, data.service)}`,
    )}&body=${encodeURIComponent(buildMailtoBody(data, mailtoNote))}`;

    return NextResponse.json({ ok: true, mailto });
  }

  const notification = buildLeadNotificationEmail(brand, lead);
  const sent = await sendEmail(config, {
    ...notification,
    to: config.adminTo,
    replyTo: data.email,
    attachments: images.length > 0 ? await toAttachments(images) : undefined,
  });

  if (!sent) {
    return NextResponse.json(
      { error: "Kunne ikke sende henvendelsen. Prøv igjen eller ring oss." },
      { status: 502 },
    );
  }

  // Kvitteringen er en bonus – går den ikke gjennom, har vi likevel fått saken.
  const receipt = buildLeadReceiptEmail(brand, lead);
  await sendEmail(config, { ...receipt, to: data.email, replyTo: config.adminTo });

  return NextResponse.json({ ok: true });
}
