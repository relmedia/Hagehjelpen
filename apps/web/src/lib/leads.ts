import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type NewLead = {
  name: string;
  email: string;
  phone: string;
  service: string;
  lawnSize?: string | null;
  mower?: string | null;
  message?: string | null;
  imageCount?: number;
  source?: string;
};

/** Lagrer henvendelsen slik at den dukker opp under «Henvendelser» i
 *  dashbordet. Feiler den, skal e-posten fortsatt gå ut – derfor logger vi
 *  bare og lar kallet returnere false. */
export async function saveLead(lead: NewLead): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("leads").insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    service: lead.service,
    lawn_size: lead.lawnSize || null,
    mower: lead.mower || null,
    message: lead.message || null,
    image_count: lead.imageCount ?? 0,
    source: lead.source ?? "kontaktskjema",
    status: "ny",
  });

  if (error) {
    console.error("[leads] Kunne ikke lagre henvendelsen:", error.message);
    return false;
  }

  return true;
}
