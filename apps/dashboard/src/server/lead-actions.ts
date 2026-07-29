"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { CLOSED_LEAD_STATUSES, LEAD_STATUSES, type LeadStatus } from "@/types/lead";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function setLeadStatus(id: string, status: LeadStatus): Promise<ActionResult> {
  if (!LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "Ugyldig status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({
      status,
      // handled_at marks when the enquiry left the pipeline, so reopening clears it.
      handled_at: CLOSED_LEAD_STATUSES.includes(status) ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateLeads();
  return { ok: true };
}

export async function saveLeadNote(id: string, note: string): Promise<ActionResult> {
  const supabase = await createClient();
  const trimmed = note.trim();
  const { error } = await supabase
    .from("leads")
    .update({ note: trimmed === "" ? null : trimmed, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateLeads();
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateLeads();
  return { ok: true };
}

function revalidateLeads() {
  revalidatePath("/dashboard/henvendelser");
  revalidatePath("/dashboard/henvendelser/arkiv");
}
