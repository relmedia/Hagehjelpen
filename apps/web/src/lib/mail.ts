import "server-only";

import type { EmailBrand, RenderedEmail } from "@repo/email";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const SITE_NAME = "Hagehjelpen";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hagehjelpen.no").replace(/\/$/, "");

export type MailConfig = {
  apiKey: string;
  from: string;
  adminTo: string;
};

export type MailAttachment = {
  filename: string;
  content: string;
};

type EmailSettingsRow = {
  resend_api_key: string | null;
  email_from: string | null;
  lead_admin_email: string | null;
};

type SiteSettingsRow = {
  title: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebook_url: string | null;
};

function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Avsender, mottaker og API-nøkkel hentes fra dashbordet, slik at e-posten
 *  styres ett sted. Miljøvariabler brukes som reserve når tjenestenøkkelen for
 *  Supabase ikke er satt – da er innstillingene utilgjengelige herfra. */
export async function getMailContext(): Promise<{
  config: MailConfig | null;
  brand: EmailBrand;
}> {
  const supabase = getSupabaseAdminClient();

  let email: EmailSettingsRow | null = null;
  let site: SiteSettingsRow | null = null;

  if (supabase) {
    const [emailRes, siteRes] = await Promise.all([
      supabase
        .from("email_settings")
        .select("resend_api_key,email_from,lead_admin_email")
        .eq("id", "singleton")
        .maybeSingle(),
      supabase
        .from("settings")
        .select("title,phone,email,address,facebook_url")
        .eq("id", "singleton")
        .maybeSingle(),
    ]);

    if (emailRes.error) console.error("[mail] Kunne ikke lese e-postoppsett:", emailRes.error.message);
    email = (emailRes.data as EmailSettingsRow | null) ?? null;
    site = (siteRes.data as SiteSettingsRow | null) ?? null;
  }

  const apiKey = clean(email?.resend_api_key) ?? clean(process.env.RESEND_API_KEY);
  const from = clean(email?.email_from) ?? clean(process.env.CONTACT_FROM);
  const adminTo =
    clean(email?.lead_admin_email) ?? clean(process.env.CONTACT_TO) ?? "post@hagehjelpen.no";

  if (!apiKey || !from) {
    console.warn(
      "[mail] Fant ikke Resend-oppsett, så skjemaet faller tilbake til mailto." +
        ` Mangler: ${[!apiKey && "API-nøkkel", !from && "avsender"].filter(Boolean).join(" og ")}.` +
        ` Kilde: ${supabase ? "dashbordet (email_settings)" : "miljøvariabler – SUPABASE_SECRET_KEY er ikke satt"}.`,
    );
  }

  return {
    config: apiKey && from ? { apiKey, from, adminTo } : null,
    brand: {
      siteName: clean(site?.title) ?? SITE_NAME,
      siteUrl: SITE_URL,
      contact: {
        phone: clean(site?.phone),
        email: clean(site?.email) ?? adminTo,
        address: clean(site?.address),
        facebookUrl: clean(site?.facebook_url),
      },
    },
  };
}

export async function sendEmail(
  config: MailConfig,
  message: RenderedEmail & {
    to: string;
    replyTo?: string;
    attachments?: MailAttachment[];
  },
): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        ...(message.attachments?.length ? { attachments: message.attachments } : {}),
      }),
    });

    if (!response.ok) {
      console.error("[mail] Resend svarte", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[mail] Kunne ikke sende e-post:", error);
    return false;
  }
}
