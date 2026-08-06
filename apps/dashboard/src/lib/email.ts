// The templates live in the shared @repo/email package so the website and the
// dashboard send e-mail with the same branding.
export {
  buildInspectionConfirmedEmail,
  type EmailBadgeTone,
  type EmailBrand,
  type EmailContact,
  type EmailDetailRow,
  type EmailOptions,
  type InspectionEmailDetails,
  renderEmail,
  renderEmailText,
} from "@repo/email";
