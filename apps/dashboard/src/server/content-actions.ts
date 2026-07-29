"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { getEmailSettings, getSettings } from "@/lib/content";
import { renderEmail, renderEmailText } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() ?? "";
}

function strOrNull(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

function intOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === "") return null;
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

// Textareas where every line becomes one bullet point on the website.
function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const now = () => new Date().toISOString();

// Writes a row and returns the Supabase error, if any. An empty id means insert.
async function upsertRow(table: string, id: string, payload: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from(table).update(payload).eq("id", id)
    : await supabase.from(table).insert({ id: randomUUID(), ...payload });
  return error;
}

async function deleteRow(table: string, id: string, path: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(path);
  return { ok: true };
}

// ---------------- Services (Tjenester) ----------------

export async function saveService(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { ok: false, error: "Tittel er påkrevd." };

  const error = await upsertRow("services", id, {
    title,
    slug: str(formData, "slug") || slugify(title),
    short_description: strOrNull(formData, "short_description"),
    body: strOrNull(formData, "body"),
    price_from: intOrNull(formData, "price_from"),
    image_url: strOrNull(formData, "image_url"),
    image_alt: strOrNull(formData, "image_alt"),
    order: intOrNull(formData, "order") ?? 0,
    active: bool(formData, "active"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/tjenester");
  return { ok: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  return deleteRow("services", id, "/dashboard/tjenester");
}

// ---------------- Mowers (Robotklippere) ----------------

export async function saveMower(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { ok: false, error: "Modellnavn er påkrevd." };

  const error = await upsertRow("mowers", id, {
    title,
    slug: str(formData, "slug") || slugify(title),
    brand: strOrNull(formData, "brand"),
    max_area: intOrNull(formData, "max_area"),
    max_slope: intOrNull(formData, "max_slope"),
    boundary: strOrNull(formData, "boundary"),
    price: intOrNull(formData, "price"),
    features: lines(formData, "features"),
    short_description: strOrNull(formData, "short_description"),
    body: strOrNull(formData, "body"),
    image_url: strOrNull(formData, "image_url"),
    image_alt: strOrNull(formData, "image_alt"),
    order: intOrNull(formData, "order") ?? 0,
    active: bool(formData, "active"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/klippere");
  return { ok: true };
}

export async function deleteMower(id: string): Promise<ActionResult> {
  return deleteRow("mowers", id, "/dashboard/klippere");
}

// ---------------- Price tiers (Priser) ----------------

export async function savePriceTier(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { ok: false, error: "Tittel er påkrevd." };

  const error = await upsertRow("price_tiers", id, {
    title,
    min_area: intOrNull(formData, "min_area"),
    max_area: intOrNull(formData, "max_area"),
    price: intOrNull(formData, "price"),
    includes: lines(formData, "includes"),
    note: strOrNull(formData, "note"),
    order: intOrNull(formData, "order") ?? 0,
    active: bool(formData, "active"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/priser");
  return { ok: true };
}

export async function deletePriceTier(id: string): Promise<ActionResult> {
  return deleteRow("price_tiers", id, "/dashboard/priser");
}

// ---------------- Coverage areas (Dekningsområde) ----------------

export async function saveCoverageArea(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const postalCode = str(formData, "postal_code");
  const place = str(formData, "place");

  if (!/^\d{4}$/.test(postalCode)) return { ok: false, error: "Postnummer må være fire siffer." };
  if (!place) return { ok: false, error: "Poststed er påkrevd." };

  const zone = str(formData, "zone") === "utvidet" ? "utvidet" : "kjerne";

  const error = await upsertRow("coverage_areas", id, {
    postal_code: postalCode,
    place,
    zone,
    travel_fee: intOrNull(formData, "travel_fee"),
    note: strOrNull(formData, "note"),
    active: bool(formData, "active"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/dekning");
  return { ok: true };
}

export async function deleteCoverageArea(id: string): Promise<ActionResult> {
  return deleteRow("coverage_areas", id, "/dashboard/dekning");
}

// ---------------- Testimonials (Kundeomtaler) ----------------

export async function saveTestimonial(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const name = str(formData, "name");
  const quote = str(formData, "quote");

  if (!name) return { ok: false, error: "Navn er påkrevd." };
  if (!quote) return { ok: false, error: "Omtalen kan ikke være tom." };

  const rating = intOrNull(formData, "rating");

  const error = await upsertRow("testimonials", id, {
    name,
    place: strOrNull(formData, "place"),
    rating: rating === null ? null : Math.min(5, Math.max(1, rating)),
    quote,
    service: strOrNull(formData, "service"),
    published_at: strOrNull(formData, "published_at"),
    order: intOrNull(formData, "order") ?? 0,
    published: bool(formData, "published"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/omtaler");
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return deleteRow("testimonials", id, "/dashboard/omtaler");
}

// ---------------- FAQ (Spørsmål og svar) ----------------

export async function saveFaqItem(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const question = str(formData, "question");
  const answer = str(formData, "answer");

  if (!question) return { ok: false, error: "Spørsmål er påkrevd." };
  if (!answer) return { ok: false, error: "Svar er påkrevd." };

  const error = await upsertRow("faq_items", id, {
    question,
    answer,
    category: strOrNull(formData, "category"),
    order: intOrNull(formData, "order") ?? 0,
    published: bool(formData, "published"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/sporsmal");
  return { ok: true };
}

export async function deleteFaqItem(id: string): Promise<ActionResult> {
  return deleteRow("faq_items", id, "/dashboard/sporsmal");
}

// ---------------- Articles (Artikler) ----------------

export async function saveArticle(formData: FormData): Promise<ActionResult> {
  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { ok: false, error: "Tittel er påkrevd." };

  const error = await upsertRow("articles", id, {
    title,
    slug: str(formData, "slug") || slugify(title),
    published_at: strOrNull(formData, "published_at"),
    excerpt: strOrNull(formData, "excerpt"),
    cover_image_url: strOrNull(formData, "cover_image_url"),
    body: strOrNull(formData, "body"),
    updated_at: now(),
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/artikler");
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  return deleteRow("articles", id, "/dashboard/artikler");
}

// ---------------- Pages (Sider) ----------------

export async function savePage(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { ok: false, error: "Tittel er påkrevd." };

  const slug = str(formData, "slug");
  const payload = {
    title,
    body: strOrNull(formData, "body"),
    updated_at: now(),
  };

  // The slug decides where the page shows on the website. When editing, an
  // empty slug field keeps the existing slug instead of regenerating it from
  // the title (which would silently unlink fixed pages).
  const { error } = id
    ? await supabase
        .from("pages")
        .update(slug ? { ...payload, slug } : payload)
        .eq("id", id)
    : await supabase.from("pages").insert({ id: randomUUID(), ...payload, slug: slug || slugify(title) });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/sider");
  return { ok: true };
}

export async function deletePage(id: string): Promise<ActionResult> {
  return deleteRow("pages", id, "/dashboard/sider");
}

// ---------------- Site settings (Innstillinger) ----------------

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const payload = {
    id: str(formData, "id") || "singleton",
    title: strOrNull(formData, "title"),
    tagline: strOrNull(formData, "tagline"),
    hero_heading: strOrNull(formData, "hero_heading"),
    hero_body: strOrNull(formData, "hero_body"),
    phone: strOrNull(formData, "phone"),
    email: strOrNull(formData, "email"),
    address: strOrNull(formData, "address"),
    org_number: strOrNull(formData, "org_number"),
    service_area: strOrNull(formData, "service_area"),
    hourly_rate: intOrNull(formData, "hourly_rate"),
    facebook_url: strOrNull(formData, "facebook_url"),
    instagram_url: strOrNull(formData, "instagram_url"),
    meta_description: strOrNull(formData, "meta_description"),
    updated_at: now(),
  };

  const { error } = await supabase.from("settings").upsert(payload, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/innstillinger");
  return { ok: true };
}

export async function saveEmailSettings(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const existing = await getEmailSettings();
  const apiKeyInput = str(formData, "resend_api_key");
  const clearApiKey = bool(formData, "clear_resend_api_key");

  const payload = {
    id: "singleton",
    resend_api_key: clearApiKey ? null : apiKeyInput || existing.resend_api_key,
    email_from: strOrNull(formData, "email_from"),
    lead_admin_email: strOrNull(formData, "lead_admin_email"),
    updated_at: now(),
  };

  const { error } = await supabase.from("email_settings").upsert(payload, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/innstillinger/e-post");
  return { ok: true };
}

export async function sendTestEmail(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Du må være innlogget for å sende test e-post." };

  const [existing, settings] = await Promise.all([getEmailSettings(), getSettings()]);
  const apiKey = str(formData, "resend_api_key") || existing.resend_api_key?.trim() || null;
  const from = str(formData, "email_from") || existing.email_from?.trim() || null;
  const to = str(formData, "test_email");

  if (!apiKey || !from) {
    return { ok: false, error: "Resend API-nøkkel og avsender må være satt før du kan sende test." };
  }
  if (!to) {
    return { ok: false, error: "Oppgi en e-postadresse som skal motta testen." };
  }

  const siteName = settings.title?.trim() || "Hagehjelpen";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hagehjelpen.no").replace(/\/$/, "");

  const options = {
    siteName,
    siteUrl,
    preheader: "Testmelding fra dashbordet – Resend er konfigurert riktig.",
    badge: { label: "Test", tone: "info" as const },
    heading: "Test e-post",
    intro: [
      `Dette er en testmelding sendt fra ${siteName}-dashbordet.`,
      "Hvis du mottar denne e-posten, er Resend konfigurert riktig.",
    ],
    detailTitle: "Innstillinger",
    detailRows: [
      { label: "Avsender", value: from },
      { label: "Mottaker", value: to },
    ],
    contact: {
      phone: settings.phone?.trim() || undefined,
      email: settings.email?.trim() || undefined,
      address: settings.address?.trim() || undefined,
      facebookUrl: settings.facebook_url?.trim() || undefined,
    },
    signoff: false,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Test e-post – ${siteName}`,
        html: renderEmail(options),
        text: renderEmailText(options),
      }),
    });

    const rawBody = await response.text();
    console.log(`[test-email] Resend status=${response.status} from=${from} to=${to} body=${rawBody}`);

    if (!response.ok) {
      let message = `Resend returnerte feil (${response.status}).`;
      try {
        const body = JSON.parse(rawBody) as { message?: string; name?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore JSON parse errors
      }
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (error) {
    console.error("[test-email] Send failed:", error);
    return { ok: false, error: "Kunne ikke sende test e-post. Sjekk nettverkstilkoblingen og prøv igjen." };
  }
}
