import { NextResponse } from "next/server";

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  service: string;
  lawnSize: string;
  mower: string;
  message: string;
};

type Attachment = {
  filename: string;
  content: string;
};

const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SERVICE_LABELS: Record<string, string> = {
  installasjon: "Installasjon av robotgressklipper",
  feilsoking: "Feilsøking / service",
  usikker: "Usikker – trenger rådgivning",
};

const LAWN_LABELS: Record<string, string> = {
  "0-1000": "0–1000 m²",
  "1000-2000": "1000–2000 m²",
  "2000-plus": "2000 m² og oppover",
  ukjent: "Vet ikke",
};

const MOWER_LABELS: Record<string, string> = {
  husqvarna: "Husqvarna Automower",
  gardena: "Gardena",
  worx: "Worx Landroid",
  ambrogio: "Ambrogio",
  segway: "Segway Navimow",
  annet: "Annet / vet ikke",
  ingen: "Har ikke robotgressklipper ennå",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildEmailBody(data: ContactPayload, imageNote: string) {
  return [
    "Ny henvendelse fra hagehjelpen.no",
    "",
    `Navn: ${data.name}`,
    `E-post: ${data.email}`,
    `Telefon: ${data.phone}`,
    "",
    `Tjeneste: ${SERVICE_LABELS[data.service] ?? data.service}`,
    `Plenstørrelse: ${LAWN_LABELS[data.lawnSize] ?? data.lawnSize}`,
    `Robotgressklipper: ${MOWER_LABELS[data.mower] ?? data.mower}`,
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

async function toAttachments(images: File[]): Promise<Attachment[]> {
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

  if (!data.name || !data.email || !data.phone || !data.service || !data.lawnSize || !data.mower) {
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

  const resendKey = process.env.RESEND_API_KEY;
  const contactTo = process.env.CONTACT_TO ?? "post@hagehjelpen.no";
  const subject = `Henvendelse: ${SERVICE_LABELS[data.service] ?? data.service}`;

  if (resendKey) {
    const imageNote =
      images.length > 0
        ? `Vedlegg: ${images.length} bilde(r) av hagen fra kunden.`
        : "";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "Hagehjelpen <onboarding@resend.dev>",
        to: [contactTo],
        reply_to: data.email,
        subject,
        text: buildEmailBody(data, imageNote),
        ...(images.length > 0 ? { attachments: await toAttachments(images) } : {}),
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Kunne ikke sende henvendelsen. Prøv igjen eller ring oss." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  // Uten e-postoppsett returnerer vi mailto-lenke som fallback. Vedlegg må da
  // legges ved manuelt i e-postklienten som åpnes.
  const mailtoNote =
    images.length > 0
      ? `Jeg har ${images.length} bilde(r) av hagen – husk å legge dem ved denne e-posten.`
      : "";

  const mailto = `mailto:${contactTo}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(buildEmailBody(data, mailtoNote))}`;

  return NextResponse.json({ ok: true, mailto });
}
