import "server-only";

import { getEmailSettings, getSettings } from "@/lib/content";
import { buildInspectionConfirmedEmail } from "@/lib/email";
import { SERVICE_LABELS } from "@/types/lead";

const SITE_NAME = "Hagehjelpen";

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hagehjelpen.no").replace(/\/$/, "");
}

function formatDateNbLong(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export interface DashboardInspectionEmailDetails {
  firstName: string;
  email: string;
  service: string;
  date: string;
  time: string;
  address?: string | null;
  message?: string | null;
  cancelToken: string;
}

export async function sendInspectionConfirmedEmail(
  inspection: DashboardInspectionEmailDetails,
): Promise<boolean> {
  const [emailSettings, siteSettings] = await Promise.all([getEmailSettings(), getSettings()]);
  const apiKey = emailSettings.resend_api_key?.trim();
  const from = emailSettings.email_from?.trim();

  if (!apiKey || !from) {
    console.warn("[inspection-email] Email not configured.");
    return false;
  }

  const email = buildInspectionConfirmedEmail(
    {
      siteName: siteSettings.title?.trim() || SITE_NAME,
      siteUrl: getSiteUrl(),
      contact: {
        phone: siteSettings.phone?.trim() || undefined,
        email: siteSettings.email?.trim() || undefined,
        address: siteSettings.address?.trim() || undefined,
        facebookUrl: siteSettings.facebook_url?.trim() || undefined,
      },
    },
    {
      firstName: inspection.firstName,
      serviceLabel: SERVICE_LABELS[inspection.service] ?? inspection.service,
      dateLabel: formatDateNbLong(inspection.date),
      time: inspection.time,
      address: inspection.address,
      message: inspection.message,
      cancelToken: inspection.cancelToken,
    },
  );

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: inspection.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!response.ok) {
      console.error("[inspection-email] Send failed:", response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[inspection-email] Send failed:", error);
    return false;
  }
}
