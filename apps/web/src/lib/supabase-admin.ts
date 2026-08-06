import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Klient med tjenestenøkkel, kun for API-ruter på serveren. Den omgår RLS, så
 *  den brukes bare der nettsiden må skrive henvendelser eller lese oppsett som
 *  ikke er offentlig. Returnerer null når nøkkelen ikke er satt. */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
