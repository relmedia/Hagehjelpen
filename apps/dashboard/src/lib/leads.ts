import { createClient } from "@/lib/supabase/server";
import { CLOSED_LEAD_STATUSES, type Lead } from "@/types/lead";

async function selectLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  return (data as Lead[] | null) ?? [];
}

// Enquiries that still need work – newest first.
export async function getOpenLeads(): Promise<Lead[]> {
  const leads = await selectLeads();
  return leads.filter((lead) => !CLOSED_LEAD_STATUSES.includes(lead.status));
}

// Enquiries that were won or lost.
export async function getArchivedLeads(): Promise<Lead[]> {
  const leads = await selectLeads();
  return leads.filter((lead) => CLOSED_LEAD_STATUSES.includes(lead.status));
}
