import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Anonym leseklient mot innholdet dashbordet redigerer. Returnerer null når
 *  Supabase ikke er satt opp, slik at nettsiden kan falle tilbake på
 *  innebygde data i stedet for å feile. */
export function getSupabaseReadClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
