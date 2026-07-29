import { getSupabaseReadClient } from "./supabase";

export type Zone = "kjerne" | "utvidet" | "utenfor";

export type CoverageArea = {
  name: string;
  from: number;
  to: number;
  zone: Zone;
  /** Fast kjøretillegg for området, i kroner. */
  travelFee: number | null;
  note: string | null;
};

/** Postnummerintervaller rundt basen på Ræge. Brukes hvis Supabase ikke er satt
 *  opp eller ikke svarer – samme innhold som `supabase/seed-coverage-areas.sql`. */
const FALLBACK_AREAS: CoverageArea[] = [
  { name: "Stavanger", from: 4001, to: 4049, zone: "kjerne", travelFee: null, note: null },
  { name: "Sola", from: 4050, to: 4069, zone: "kjerne", travelFee: null, note: null },
  { name: "Randaberg", from: 4070, to: 4079, zone: "kjerne", travelFee: null, note: null },
  { name: "Strand og Jørpeland", from: 4100, to: 4129, zone: "utvidet", travelFee: null, note: null },
  { name: "Ryfylke", from: 4130, to: 4199, zone: "utvidet", travelFee: null, note: null },
  { name: "Sauda og Suldal", from: 4200, to: 4299, zone: "utenfor", travelFee: null, note: null },
  { name: "Sandnes", from: 4300, to: 4329, zone: "kjerne", travelFee: null, note: null },
  { name: "Gjesdal og Ålgård", from: 4330, to: 4339, zone: "utvidet", travelFee: null, note: null },
  { name: "Time og Bryne", from: 4340, to: 4349, zone: "utvidet", travelFee: null, note: null },
  { name: "Klepp og Kvernaland", from: 4350, to: 4359, zone: "utvidet", travelFee: null, note: null },
  { name: "Hå", from: 4360, to: 4369, zone: "utvidet", travelFee: null, note: null },
  { name: "Eigersund og Dalane", from: 4370, to: 4399, zone: "utenfor", travelFee: null, note: null },
];

type CoverageAreaRow = {
  place: string;
  postal_code_from: number;
  postal_code_to: number;
  zone: Zone;
  travel_fee: number | null;
  note: string | null;
};

/** Dekningsområdene i postnummersjekken, hentet fra dashbordet. */
export async function getCoverageAreas(): Promise<CoverageArea[]> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return FALLBACK_AREAS;

  const { data, error } = await supabase
    .from("coverage_areas")
    .select("place, postal_code_from, postal_code_to, zone, travel_fee, note")
    .eq("active", true)
    .order("postal_code_from", { ascending: true });

  if (error || !data || data.length === 0) return FALLBACK_AREAS;

  return (data as CoverageAreaRow[]).map((row) => ({
    name: row.place,
    from: row.postal_code_from,
    to: row.postal_code_to,
    zone: row.zone,
    travelFee: row.travel_fee,
    note: row.note,
  }));
}
