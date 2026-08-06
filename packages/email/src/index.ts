export {
  type EmailBadgeTone,
  type EmailBrand,
  type EmailContact,
  type EmailDetailRow,
  type EmailOptions,
  type RenderedEmail,
  renderEmail,
  renderEmailText,
} from "./render";

export {
  LAWN_SIZE_LABELS,
  LEAD_SOURCE_LABELS,
  MOWER_LABELS,
  SERVICE_LABELS,
} from "./labels";

export {
  buildInspectionConfirmedEmail,
  type InspectionEmailDetails,
} from "./templates/inspection";

export {
  buildLeadNotificationEmail,
  buildLeadReceiptEmail,
  type LeadEmailDetails,
} from "./templates/lead";
