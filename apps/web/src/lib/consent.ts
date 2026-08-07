/**
 * Samtykke til lagring i nettleseren, etter ekomloven § 3-15 og GDPR.
 *
 * Nødvendig lagring (spamsjekk i skjemaet, utfylling som følger med når du
 * hopper til skjemaet, og selve samtykkevalget) trenger ikke samtykke og har
 * derfor ingen kategori her. Alt annet er avslått til besøkende sier ja.
 */

export type ConsentCategories = {
  /** Egen besøksmåling: hvor mange som er innom og hvor langt ned de kommer. */
  statistikk: boolean;
};

export type Consent = ConsentCategories & {
  /** Når valget ble tatt. Vi må kunne dokumentere samtykket. */
  tidspunkt: string;
};

const COOKIE_NAME = "hh-samtykke";

/** Økes når kategoriene endres, slik at gamle valg blir spurt om på nytt. */
const VERSION = 1;

/** Datatilsynet anbefaler å spørre på nytt minst én gang i året. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const CONSENT_CHANGED_EVENT = "hh-samtykke-endret";
export const CONSENT_SETTINGS_EVENT = "hh-samtykke-innstillinger";

/** Åpner innstillingene fra hvor som helst, for eksempel bunnteksten. */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT));
}

export const NO_CONSENT: ConsentCategories = { statistikk: false };
export const FULL_CONSENT: ConsentCategories = { statistikk: true };

type StoredConsent = ConsentCategories & { v: number; tidspunkt: string };

function readCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** null betyr at besøkende ikke har tatt stilling ennå. */
export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;

  const raw = readCookie();
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as StoredConsent;
    if (stored.v !== VERSION) return null;

    return {
      statistikk: stored.statistikk === true,
      tidspunkt: stored.tidspunkt,
    };
  } catch {
    return null;
  }
}

export function writeConsent(categories: ConsentCategories): void {
  const stored: StoredConsent = {
    v: VERSION,
    statistikk: categories.statistikk,
    tidspunkt: new Date().toISOString(),
  };

  const value = encodeURIComponent(JSON.stringify(stored));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;

  // Trekkes statistikk tilbake, skal sporet etter den også bort.
  if (!categories.statistikk) clearAnalyticsStorage();

  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

/** Sletter valget slik at banneret dukker opp igjen. */
export function resetConsent(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
  clearAnalyticsStorage();
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

function clearAnalyticsStorage(): void {
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith("hh-session")) sessionStorage.removeItem(key);
  }
}

export function hasConsent(category: keyof ConsentCategories): boolean {
  return readConsent()?.[category] === true;
}
