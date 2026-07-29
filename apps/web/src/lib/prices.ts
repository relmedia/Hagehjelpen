import { lawnSizeFromArea } from "./contact-prefill";
import { getSupabaseReadClient } from "./supabase";

export type PricePlan = {
  title: string;
  /** Pris eks. mva. Tom pris vises som «etter befaring». */
  price: number | null;
  includes: string[];
  note: string | null;
  featured: boolean;
  /** Alternativet som fylles inn i kontaktskjemaet. */
  lawnSize: string;
};

const INCLUDED = [
  "Gjennomgang av eiendommen sammen med deg før installasjon",
  "Installasjon av robotklipper og ladestasjon",
  "Kanttråd, plugger og skjøter",
  "Programmering av robotklipperen",
  "Kort gjennomgang av brukermanual og riktig bruk",
  "Etterkontroll og justering ved behov innen 2 uker",
  "Kjøring inntil 15 km",
];

/** Prisnivåene vi viser hvis Supabase ikke er satt opp eller ikke svarer.
 *  Samme innhold som `supabase/seed-price-tiers.sql`. */
const FALLBACK_PLANS: PricePlan[] = [
  {
    title: "0 – 1000 m²",
    price: 4000,
    includes: INCLUDED,
    note: null,
    featured: false,
    lawnSize: "0-1000",
  },
  {
    title: "1000 – 2000 m²",
    price: 6750,
    includes: INCLUDED,
    note: null,
    featured: true,
    lawnSize: "1000-2000",
  },
  {
    title: "2000 m² og oppover",
    price: 9250,
    includes: INCLUDED,
    note: null,
    featured: false,
    lawnSize: "2000-plus",
  },
];

type PriceTierRow = {
  title: string;
  min_area: number | null;
  max_area: number | null;
  price: number | null;
  includes: string[] | null;
  note: string | null;
  featured: boolean | null;
};

/** Øvre grense uten tak betyr det største alternativet i skjemaet. */
function lawnSizeForTier(maxArea: number | null): string {
  return maxArea === null ? "2000-plus" : lawnSizeFromArea(maxArea);
}

/** Prisnivåene i installasjonsseksjonen, hentet fra dashbordet. */
export async function getPricePlans(): Promise<PricePlan[]> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return FALLBACK_PLANS;

  const { data, error } = await supabase
    .from("price_tiers")
    .select("title, min_area, max_area, price, includes, note, featured")
    .eq("active", true)
    .order("order", { ascending: true });

  if (error || !data || data.length === 0) return FALLBACK_PLANS;

  return (data as PriceTierRow[]).map((row) => ({
    title: row.title,
    price: row.price,
    includes: row.includes ?? [],
    note: row.note,
    featured: row.featured ?? false,
    lawnSize: lawnSizeForTier(row.max_area),
  }));
}
