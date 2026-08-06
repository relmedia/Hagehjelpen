// Branded transactional e-mail templates for Hagehjelpen. Plain string
// building on purpose: e-mail clients need table layout and inline styles, and
// this keeps both apps free of a rendering dependency.

const COLORS = {
  leaf: "#65b427",
  leafDark: "#3b6e1a",
  leafSoft: "#e4f6cf",
  // Den mørke grønnfargen i logoen, brukt på ordmerket ved siden av den.
  brand: "#305930",
  ink: "#20261c",
  inkSoft: "#47503f",
  // Dempet tone og hårstrek til bunnteksten, som skal ligge bak innholdet.
  faint: "#79836f",
  hairline: "#edf0e8",
  border: "#e2e8dc",
  canvas: "#f6f8f3",
};

const SEPARATOR = "&nbsp;&middot;&nbsp;";

export type EmailContact = {
  phone?: string;
  email?: string;
  address?: string;
  facebookUrl?: string;
};

export type EmailBrand = {
  siteName: string;
  siteUrl: string;
  /** Absolutt URL til logoen. E-postklienter viser ikke SVG, så den må være en
   *  PNG. Er den ikke satt, brukes /logo-email.png på nettstedet. */
  logoUrl?: string;
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

function footer(options: EmailOptions): string {
  const contact = options.contact ?? {};
  const linkStyle = `color:${COLORS.faint};text-decoration:none;`;

  // Sted og telefon på én linje, kontaktveier på neste. Kortere enn en liste
  // med etiketter, og lettere å skumme.
  const details = [
    contact.address ? escapeHtml(contact.address) : "",
    contact.phone
      ? `<a href="tel:${escapeHtml(contact.phone.replace(/\s+/g, ""))}" style="${linkStyle}">${escapeHtml(contact.phone)}</a>`
      : "",
  ].filter(Boolean);

  const links = [
    contact.email
      ? `<a href="mailto:${escapeHtml(contact.email)}" style="${linkStyle}">${escapeHtml(contact.email)}</a>`
      : "",
    `<a href="${escapeHtml(options.siteUrl)}" style="${linkStyle}">${escapeHtml(options.siteUrl.replace(/^https?:\/\//, ""))}</a>`,
    contact.facebookUrl
      ? `<a href="${escapeHtml(contact.facebookUrl)}" style="${linkStyle}">Facebook</a>`
      : "",
  ].filter(Boolean);

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="height:1px;background:${COLORS.hairline};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="padding:20px 0 0;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${COLORS.ink};">${escapeHtml(options.siteName)}</p>
          ${
            details.length
              ? `<p style="margin:0 0 4px;font-size:13px;line-height:1.7;color:${COLORS.faint};">${details.join(SEPARATOR)}</p>`
              : ""
          }
          <p style="margin:0;font-size:13px;line-height:1.7;color:${COLORS.faint};">${links.join(SEPARATOR)}</p>
        </td>
      </tr>
    </table>`;
}

// Logo og navn side om side. To celler i stedet for flex, siden Outlook ikke
// har noe forhold til moderne layout.
function header(options: EmailOptions): string {
  const siteUrl = escapeHtml(options.siteUrl);
  const logoUrl = escapeHtml(
    options.logoUrl ?? `${options.siteUrl.replace(/\/$/, "")}/logo-email.png`,
  );
  const siteName = escapeHtml(options.siteName);

  return `
    <a href="${siteUrl}" style="text-decoration:none;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
        <tr>
          <td style="padding-right:11px;vertical-align:middle;">
            <img src="${logoUrl}" width="38" height="38" alt="${siteName}" style="display:block;width:38px;height:auto;border:0;outline:none;">
          </td>
          <td style="vertical-align:middle;">
            <span style="color:${COLORS.brand};font-size:17px;font-weight:600;letter-spacing:0.01em;">${siteName}</span>
          </td>
        </tr>
      </table>
    </a>`;
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:700px;background:#ffffff;border:1px solid ${COLORS.border};border-radius:18px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:36px 36px 0;text-align:center;">
                ${header(options)}
              </td>
            </tr>
            <tr>
              <td style="padding:36px;">
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
              <td style="padding:0 36px 32px;">
                ${footer(options)}
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
