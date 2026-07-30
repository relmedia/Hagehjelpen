// Types and pure helpers shared between server analytics queries and client
// components. Must stay free of server-only imports.

export type AnalyticsRange = "last-7-days" | "last-4-weeks" | "last-3-months" | "year-to-date";

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  "last-7-days": "siste 7 dager",
  "last-4-weeks": "siste 4 uker",
  "last-3-months": "siste 3 måneder",
  "year-to-date": "hittil i år",
};

export type KpiDatum = {
  title: string;
  value: string;
  change: number | null; // relative change vs previous period, e.g. 0.028
  previous: string | null;
  periodLabel: string;
};

export type SourceRow = {
  source: string;
  visitors: number;
};

/** Én seksjon på forsiden, eller ett verktøy som ble brukt. */
export type EngagementRow = {
  label: string;
  visitors: number;
  /** Andel av besøkende i perioden som kom hit / gjorde dette. */
  share: number;
};

/** Ankere på forsiden, i den rekkefølgen de står. Kortet leses da som en trakt:
 *  hvor mange faller av før prisene, kalkulatoren og kontaktskjemaet. */
export const SECTION_ORDER = [
  "fordeler",
  "slik-fungerer-det",
  "installasjon",
  "kalkulator",
  "velg-klipper",
  "huskeliste",
  "feilsoking",
  "omtaler",
  "faq",
  "befaring",
  "kontakt",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  fordeler: "Fordeler",
  "slik-fungerer-det": "Slik fungerer det",
  installasjon: "Priser",
  kalkulator: "Prisberegner",
  "velg-klipper": "Velg klipper",
  huskeliste: "Huskeliste",
  feilsoking: "Feilsøking",
  omtaler: "Kundeomtaler",
  faq: "Spørsmål og svar",
  befaring: "Book befaring",
  kontakt: "Kontaktskjema",
};

export const ACTION_LABELS: Record<string, string> = {
  kalkulator: "Brukte prisberegneren",
  plenmaling: "Målte opp plenen i kartet",
  "estimat-til-skjema": "Sendte estimat til skjemaet",
  dekningssjekk: "Sjekket postnummer",
  produktvelger: "Brukte produktvelgeren",
  "skjema-sendt": "Sendte kontaktskjemaet",
  telefon: "Trykket på telefonnummeret",
};

export type DailyPoint = {
  date: string; // ISO date
  pageviews: number;
  visitors: number;
};

export type RealtimePoint = {
  minute: string; // HH:mm label
  visitors: number;
};

export type CountryRow = {
  code: string; // ISO 3166-1 alpha-2
  name: string; // Norwegian display name
  visitors: number;
  share: number; // fraction of visitors with a known country
};

export type CityRow = {
  city: string;
  countryCode: string | null;
  visitors: number;
};

export type AnalyticsData = {
  kpis: KpiDatum[];
  daily: DailyPoint[];
  sections: EngagementRow[];
  actions: EngagementRow[];
  sources: SourceRow[];
  referrers: SourceRow[];
  countries: CountryRow[];
  cities: CityRow[];
  realtime: { points: RealtimePoint[]; visitors: number };
  periodLabel: string;
};

const compactFormatter = new Intl.NumberFormat("nb-NO", { notation: "compact", maximumFractionDigits: 1 });

export function formatCount(value: number): string {
  return compactFormatter.format(value);
}

export function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  if (value === "last-7-days" || value === "last-3-months" || value === "year-to-date") return value;
  return "last-4-weeks";
}
