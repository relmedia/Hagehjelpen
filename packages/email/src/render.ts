// Branded transactional e-mail templates for Hagehjelpen. Plain string
// building on purpose: e-mail clients need table layout and inline styles, and
// this keeps both apps free of a rendering dependency.

const COLORS = {
  leaf: "#65b427",
  leafDark: "#3b6e1a",
  leafSoft: "#e4f6cf",
  ink: "#20261c",
  inkSoft: "#47503f",
  border: "#e2e8dc",
  canvas: "#f6f8f3",
};

export type EmailContact = {
  phone?: string;
  email?: string;
  address?: string;
  facebookUrl?: string;
};

export type EmailBrand = {
  siteName: string;
  siteUrl: string;
  contact?: EmailContact;
};

export type EmailBadgeTone = "info" | "success" | "warning";

export type EmailDetailRow = {
  label: string;
  value: string;
};

export type EmailOptions = EmailBrand & {
  preheader?: string;
  badge?: { label: string; tone?: EmailBadgeTone };
  heading: string;
  intro?: string[];
  detailTitle?: string;
  detailRows?: EmailDetailRow[];
  cta?: { label: string; url: string };
  outro?: string[];
  signoff?: boolean;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

const BADGE_TONES: Record<EmailBadgeTone, { background: string; color: string }> = {
  info: { background: COLORS.leafSoft, color: COLORS.leafDark },
  success: { background: "#d8f3c4", color: "#2f5c14" },
  warning: { background: "#fdf0d5", color: "#8a5a08" },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Free-text fields keep the line breaks the customer typed.
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function detailTable(title: string | undefined, rows: EmailDetailRow[]): string {
  const cells = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:6px 0;color:${COLORS.inkSoft};font-size:13px;width:40%;">${escapeHtml(row.label)}</td>
          <td style="padding:6px 0;color:${COLORS.ink};font-size:14px;font-weight:600;">${escapeMultiline(row.value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid ${COLORS.border};border-radius:12px;background:${COLORS.canvas};">
      <tr>
        <td style="padding:18px 20px;">
          ${
            title
              ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.inkSoft};">${escapeHtml(title)}</p>`
              : ""
          }
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${cells}</table>
        </td>
      </tr>
    </table>`;
}

function contactBlock(contact: EmailContact): string {
  const lines = [
    contact.phone ? `Telefon: ${escapeHtml(contact.phone)}` : "",
    contact.email ? `E-post: ${escapeHtml(contact.email)}` : "",
    contact.address ? escapeHtml(contact.address) : "",
    contact.facebookUrl ? `<a href="${escapeHtml(contact.facebookUrl)}" style="color:${COLORS.leafDark};">Facebook</a>` : "",
  ].filter(Boolean);

  if (lines.length === 0) return "";

  return `<p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:${COLORS.inkSoft};">${lines.join("<br>")}</p>`;
}

export function renderEmail(options: EmailOptions): string {
  const badge = options.badge ? BADGE_TONES[options.badge.tone ?? "info"] : null;

  const paragraphs = (options.intro ?? [])
    .map(
      (text) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${COLORS.inkSoft};">${escapeMultiline(text)}</p>`,
    )
    .join("");

  const outro = (options.outro ?? [])
    .map(
      (text) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${COLORS.inkSoft};">${escapeMultiline(text)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="nb">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(options.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.canvas};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    ${
      options.preheader
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.canvas};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${COLORS.border};border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:22px 28px;background:${COLORS.leaf};">
                <a href="${escapeHtml(options.siteUrl)}" style="color:#ffffff;font-size:18px;font-weight:700;text-decoration:none;letter-spacing:-0.01em;">${escapeHtml(options.siteName)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${
                  badge && options.badge
                    ? `<span style="display:inline-block;margin:0 0 14px;padding:5px 12px;border-radius:999px;background:${badge.background};color:${badge.color};font-size:12px;font-weight:600;">${escapeHtml(options.badge.label)}</span>`
                    : ""
                }
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${COLORS.ink};">${escapeHtml(options.heading)}</h1>
                ${paragraphs}
                ${options.detailRows?.length ? detailTable(options.detailTitle, options.detailRows) : ""}
                ${
                  options.cta
                    ? `<p style="margin:0 0 18px;"><a href="${escapeHtml(options.cta.url)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${COLORS.leaf};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(options.cta.label)}</a></p>`
                    : ""
                }
                ${outro}
                ${
                  options.signoff === false
                    ? ""
                    : `<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:${COLORS.inkSoft};">Vennlig hilsen<br><strong style="color:${COLORS.ink};">${escapeHtml(options.siteName)}</strong></p>`
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid ${COLORS.border};background:${COLORS.canvas};">
                <a href="${escapeHtml(options.siteUrl)}" style="color:${COLORS.leafDark};font-size:13px;font-weight:600;text-decoration:none;">${escapeHtml(options.siteUrl.replace(/^https?:\/\//, ""))}</a>
                ${options.contact ? contactBlock(options.contact) : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEmailText(options: EmailOptions): string {
  return [
    options.heading,
    "",
    ...(options.intro ?? []),
    ...(options.detailRows?.length
      ? ["", options.detailTitle ?? "Detaljer", ...options.detailRows.map((row) => `${row.label}: ${row.value}`)]
      : []),
    ...(options.cta ? ["", `${options.cta.label}: ${options.cta.url}`] : []),
    ...(options.outro?.length ? ["", ...options.outro] : []),
    "",
    `Vennlig hilsen ${options.siteName}`,
    options.siteUrl,
  ].join("\n");
}
