import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type CancellableInspection = {
  date: string;
  time: string;
  address: string | null;
  status: string;
};

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Avbestillingslenken i e-posten er den eneste nøkkelen kunden har, så tokenet
 *  må se ut som en uuid før vi i det hele tatt spør databasen. */
export async function findInspectionByToken(
  token: string,
): Promise<CancellableInspection | null> {
  if (!TOKEN_PATTERN.test(token)) return null;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("inspections")
    .select("date, time, address, status")
    .eq("cancel_token", token)
    .maybeSingle();

  if (error) {
    console.error("[befaring] Kunne ikke slå opp avbestilling:", error.message);
    return null;
  }

  return (data as CancellableInspection | null) ?? null;
}

export async function cancelInspection(token: string): Promise<boolean> {
  if (!TOKEN_PATTERN.test(token)) return false;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("inspections")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("cancel_token", token)
    .neq("status", "cancelled");

  if (error) {
    console.error("[befaring] Kunne ikke avbestille:", error.message);
    return false;
  }

  return true;
}
