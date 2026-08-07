import { NextResponse } from "next/server";

import {
  buildInspectionNotificationEmail,
  buildInspectionReceivedEmail,
  SERVICE_LABELS,
} from "@repo/email";

import { isSlotBookable } from "@/lib/booking";
import { formatLongDate } from "@/lib/dates";
import { getMailContext, sendEmail } from "@/lib/mail";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { verifyTurnstile } from "@/lib/turnstile";

type BookingPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  lawnArea: string;
  date: string;
  time: string;
  message: string;
  turnstileToken: string;
};

const SERVICE = "befaring";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function read(body: Partial<BookingPayload>, key: keyof BookingPayload): string {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: Partial<BookingPayload>;

  try {
    body = (await request.json()) as Partial<BookingPayload>;
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel." }, { status: 400 });
  }

  const data = {
    firstName: read(body, "firstName"),
    lastName: read(body, "lastName"),
    email: read(body, "email"),
    phone: read(body, "phone"),
    address: read(body, "address"),
    postalCode: read(body, "postalCode"),
    lawnArea: read(body, "lawnArea"),
    date: read(body, "date"),
    time: read(body, "time"),
    message: read(body, "message"),
  };

  if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.address) {
    return NextResponse.json({ error: "Fyll ut alle obligatoriske felt." }, { status: 400 });
  }

  if (!isValidEmail(data.email)) {
    return NextResponse.json({ error: "Ugyldig e-postadresse." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) {
    return NextResponse.json({ error: "Velg en dato og et tidspunkt." }, { status: 400 });
  }

  const check = await verifyTurnstile(
    body.turnstileToken ?? "",
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  );

  if (!check.ok) {
    return NextResponse.json(
      {
        error:
          check.reason === "unavailable"
            ? "Robotsjekken svarte ikke. Prøv igjen om litt, eller ring oss."
            : "Robotsjekken feilet. Last siden på nytt og prøv igjen.",
      },
      { status: check.reason === "unavailable" ? 503 : 400 },
    );
  }

  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Bestilling er midlertidig utilgjengelig. Ring oss på 414 46 371." },
      { status: 503 },
    );
  }

  if (!(await isSlotBookable(data.date, data.time))) {
    return NextResponse.json(
      { error: "Tidspunktet er dessverre ikke ledig lenger. Velg et annet.", slotTaken: true },
      { status: 409 },
    );
  }

  const lawnArea = Number.parseInt(data.lawnArea, 10);

  const { data: created, error } = await supabase
    .from("inspections")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      postal_code: data.postalCode || null,
      lawn_area: Number.isFinite(lawnArea) && lawnArea > 0 ? lawnArea : null,
      service: SERVICE,
      date: data.date,
      time: data.time,
      message: data.message || null,
      status: "pending",
    })
    .select("cancel_token")
    .single();

  if (error) {
    // Den unike indeksen slår inn når to bestiller samme time samtidig.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Noen rakk å ta tidspunktet akkurat nå. Velg et annet.", slotTaken: true },
        { status: 409 },
      );
    }

    console.error("[booking] Kunne ikke lagre befaringen:", error.message);
    return NextResponse.json(
      { error: "Kunne ikke lagre bestillingen. Prøv igjen eller ring oss." },
      { status: 500 },
    );
  }

  // Tiden er reservert. E-postene er en bonus – går de ikke gjennom, ligger
  // bestillingen uansett i dashbordet.
  const { config, brand } = await getMailContext();

  if (config) {
    const shared = {
      serviceLabel: SERVICE_LABELS[SERVICE] ?? SERVICE,
      dateLabel: formatLongDate(data.date),
      time: data.time,
      address: data.address,
      message: data.message,
    };

    const receipt = buildInspectionReceivedEmail(brand, {
      ...shared,
      firstName: data.firstName,
      cancelToken: (created as { cancel_token: string }).cancel_token,
    });

    const notification = buildInspectionNotificationEmail(brand, {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      dateLabel: shared.dateLabel,
      time: data.time,
      address: data.address,
      postalCode: data.postalCode,
      lawnArea: Number.isFinite(lawnArea) ? lawnArea : null,
      message: data.message,
    });

    await Promise.all([
      sendEmail(config, { ...receipt, to: data.email, replyTo: config.adminTo }),
      sendEmail(config, { ...notification, to: config.adminTo, replyTo: data.email }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
