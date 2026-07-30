import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { getSupabaseReadClient } from "@/lib/supabase";

/**
 * Trafikkmåling for dashbordet. Vi lagrer ingen informasjonskapsler og ingen
 * IP-adresser: besøkende identifiseres med en hash av IP, nettleser og dagens
 * dato, så id-en byttes hvert døgn og kan ikke spores tilbake til en person.
 */

type TrackPayload = {
  path?: unknown;
  referrer?: unknown;
  sessionId?: unknown;
  kind?: unknown;
  label?: unknown;
};

const KINDS = ["view", "engaged", "section", "action"] as const;
type Kind = (typeof KINDS)[number];

function kindOf(value: unknown): Kind {
  return KINDS.includes(value as Kind) ? (value as Kind) : "view";
}

/** Seksjonsankere og handlingsnavn. Vi tillater bare enkle navn, slik at
 *  statistikken ikke kan fylles med vilkårlig tekst utenfra. */
function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[a-z0-9-]{2,40}$/.test(value) ? value : null;
}

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|lighthouse|pingdom|headless|monitor|curl|wget/i;

const MAX_PATH_LENGTH = 300;
const MAX_REFERRER_LENGTH = 300;

function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "ukjent";
}

/** Byttes ved midnatt UTC, slik at id-en ikke følger noen over tid. */
function visitorId(headers: Headers): string {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT ?? "hagehjelpen";
  const agent = headers.get("user-agent") ?? "";
  return createHash("sha256").update(`${day}:${salt}:${clientIp(headers)}:${agent}`).digest("hex").slice(0, 32);
}

/** Bare stien lagres, uten spørrestreng, slik at vi ikke fanger opp e-post
 *  eller andre personopplysninger som kan ligge i lenker. */
function cleanPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  const path = value.split(/[?#]/)[0];
  return path.slice(0, MAX_PATH_LENGTH);
}

/** Vi trenger bare domenet det ble lenket fra. Egne sider regnes som direkte. */
function cleanReferrer(value: unknown, host: string | null): string | null {
  if (typeof value !== "string" || value === "") return null;
  try {
    const { hostname } = new URL(value);
    if (!hostname || (host && hostname === host)) return null;
    return hostname.replace(/^www\./, "").slice(0, MAX_REFERRER_LENGTH);
  } catch {
    return null;
  }
}

function sessionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[a-z0-9-]{8,64}$/i.test(value) ? value : null;
}

export async function POST(request: Request) {
  const agent = request.headers.get("user-agent") ?? "";
  // Roboter og forhåndsvisninger skal ikke havne i statistikken.
  if (agent === "" || BOT_PATTERN.test(agent)) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: TrackPayload;
  try {
    payload = (await request.json()) as TrackPayload;
  } catch {
    return NextResponse.json({ error: "Ugyldig innhold." }, { status: 400 });
  }

  const path = cleanPath(payload.path);
  const session = sessionId(payload.sessionId);
  const kind = kindOf(payload.kind);
  const label = cleanLabel(payload.label);

  if (!path || !session) {
    return NextResponse.json({ error: "Mangler path eller sessionId." }, { status: 400 });
  }

  // Seksjoner og handlinger er meningsløse uten navn.
  if ((kind === "section" || kind === "action") && !label) {
    return NextResponse.json({ error: "Mangler label." }, { status: 400 });
  }

  const supabase = getSupabaseReadClient();
  // Uten Supabase er måling en no-op, på samme måte som innholdshentingen.
  if (!supabase) return new NextResponse(null, { status: 204 });

  const headers = request.headers;
  const { error } = await supabase.from("page_views").insert({
    kind,
    session_id: session,
    visitor_id: visitorId(headers),
    path,
    label,
    referrer: cleanReferrer(payload.referrer, headers.get("host")),
    // Geo settes av Vercel sitt kantnettverk; lokalt er de tomme.
    country: headers.get("x-vercel-ip-country"),
    city: decodeGeoHeader(headers.get("x-vercel-ip-city")),
  });

  if (error) {
    console.error("Kunne ikke lagre sidevisning:", error.message);
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}

/** Vercel prosentkoder bynavn, så «Sandnes» kan komme som «Sandnes» og
 *  «Sør-Trøndelag» som «S%C3%B8r-Tr%C3%B8ndelag». */
function decodeGeoHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
