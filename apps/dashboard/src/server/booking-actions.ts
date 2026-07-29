"use server";

import { revalidatePath } from "next/cache";

import { expandAvailabilityDates, parseAvailabilityScope, todayInOslo } from "@/lib/availability";
import { sendInspectionConfirmedEmail } from "@/lib/inspection-email";
import { createClient } from "@/lib/supabase/server";
import type { InspectionStatus } from "@/types/booking";

export type ActionResult = { ok: true } | { ok: false; error: string };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ---------------- Inspections (Befaringer) ----------------

export async function setInspectionStatus(id: string, status: InspectionStatus): Promise<ActionResult> {
  if (!["pending", "confirmed", "cancelled"].includes(status)) {
    return { ok: false, error: "Ugyldig status." };
  }

  const supabase = await createClient();

  if (status === "confirmed") {
    const { data: existing, error: fetchError } = await supabase
      .from("inspections")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) return { ok: false, error: fetchError.message };
    if (!existing) return { ok: false, error: "Fant ikke befaringen." };

    const wasPending = existing.status === "pending";

    const { error } = await supabase
      .from("inspections")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        cancelled_at: null,
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };

    if (wasPending) {
      const emailSent = await sendInspectionConfirmedEmail({
        firstName: existing.first_name,
        email: existing.email,
        service: existing.service,
        date: existing.date,
        time: existing.time,
        address: existing.address,
        message: existing.message,
        cancelToken: existing.cancel_token,
      });

      if (!emailSent) {
        console.warn("[dashboard] Inspection confirmed but confirmation email was not sent.");
      }
    }

    revalidateInspections();
    return { ok: true };
  }

  const { error } = await supabase
    .from("inspections")
    .update({
      status,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidateInspections();
  return { ok: true };
}

export async function deleteInspection(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("inspections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateInspections();
  return { ok: true };
}

function revalidateInspections() {
  revalidatePath("/dashboard/befaringer");
  revalidatePath("/dashboard/befaringer/historikk");
}

// ---------------- Availability (Ledige dager) ----------------

export async function saveAvailabilityDay(formData: FormData): Promise<ActionResult & { saved?: number }> {
  const date = ((formData.get("date") as string | null) ?? "").trim();
  const isClosed = formData.get("is_closed") === "on";
  const scope = parseAvailabilityScope(formData.get("scope"));
  const skipWeekends = formData.get("skip_weekends") === "on";
  const slots = formData
    .getAll("slots")
    .map((value) => String(value))
    .filter((value) => TIME_PATTERN.test(value))
    .sort();

  if (!DATE_PATTERN.test(date)) {
    return { ok: false, error: "Oppgi en gyldig dato." };
  }

  if (!isClosed && slots.length === 0) {
    return { ok: false, error: "Legg til minst ett klokkeslett, eller merk dagen som stengt." };
  }

  const dates = expandAvailabilityDates(date, scope, { skipWeekends, notBefore: todayInOslo() });

  if (dates.length === 0) {
    return { ok: false, error: "Ingen dager å lagre i den valgte perioden." };
  }

  const updatedAt = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase.from("availability_days").upsert(
    dates.map((value) => ({
      date: value,
      is_closed: isClosed,
      slots: isClosed ? [] : slots,
      updated_at: updatedAt,
    })),
    { onConflict: "date" },
  );

  if (error) return { ok: false, error: error.message };

  revalidateAvailability();
  return { ok: true, saved: dates.length };
}

export async function deleteAvailabilityDay(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("availability_days").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAvailability();
  return { ok: true };
}

export async function deletePastAvailabilityDays(): Promise<ActionResult & { deleted?: number }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_days")
    .delete()
    .lt("date", todayInOslo())
    .select("id");

  if (error) return { ok: false, error: error.message };

  revalidateAvailability();
  return { ok: true, deleted: data?.length ?? 0 };
}

function revalidateAvailability() {
  revalidatePath("/dashboard/ledige-dager");
  revalidatePath("/dashboard/ledige-dager/historikk");
}
