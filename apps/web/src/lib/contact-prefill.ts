/**
 * Verktøyene på siden (priskort, plenkalkulator, produktvelger) sender brukeren
 * videre til kontaktskjemaet med felt ferdig utfylt. Skjemaet kan allerede være
 * montert, så vi varsler det med en event i tillegg til å lagre verdiene.
 */
export const CONTACT_PREFILL_KEY = "contact-prefill";
export const CONTACT_PREFILL_EVENT = "contact-prefill";

export type ContactPrefill = {
  service?: string;
  lawnSize?: string;
  mower?: string;
  message?: string;
};

/** Plenstørrelsen i skjemaet følger samme tre trinn som prislisten. */
export function lawnSizeFromArea(area: number) {
  if (area <= 1000) return "0-1000";
  if (area <= 2000) return "1000-2000";
  return "2000-plus";
}

export function sendContactPrefill(prefill: ContactPrefill) {
  sessionStorage.setItem(CONTACT_PREFILL_KEY, JSON.stringify(prefill));
  window.dispatchEvent(new Event(CONTACT_PREFILL_EVENT));
}
