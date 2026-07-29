import { todayInOslo } from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";
import type { AvailabilityDay, Inspection } from "@/types/booking";
import { CLOSED_LEAD_STATUSES } from "@/types/lead";

// Sidebar counter: how many open items there are, and how many of those still
// need a reply.
export type SidebarCount = {
  total: number;
  pending: number;
};

export type SidebarCounts = {
  leads: SidebarCount;
  inspections: SidebarCount;
};

// Counts behind the sidebar badges. Cancelled and archived entries are left
// out, and inspections only count while they are upcoming: once the date has
// passed the entry lives on the history page, so counting it would send you to
// a page where it isn't shown.
export async function getSidebarCounts(): Promise<SidebarCounts> {
  const supabase = await createClient();
  const today = todayInOslo();
  const closed = `(${CLOSED_LEAD_STATUSES.join(",")})`;

  const [openLeads, newLeads, inspections, pendingInspections] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).not("status", "in", closed),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "ny"),
    supabase
      .from("inspections")
      .select("id", { count: "exact", head: true })
      .neq("status", "cancelled")
      .gte("date", today),
    supabase
      .from("inspections")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .gte("date", today),
  ]);

  return {
    leads: {
      total: openLeads.count ?? 0,
      pending: newLeads.count ?? 0,
    },
    inspections: {
      total: inspections.count ?? 0,
      pending: pendingInspections.count ?? 0,
    },
  };
}

// Befaringer today or later, soonest first.
export async function getInspections(): Promise<Inspection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inspections")
    .select("*")
    .gte("date", todayInOslo())
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  return (data as Inspection[] | null) ?? [];
}

// Befaringer whose date has passed, most recent first.
export async function getPastInspections(): Promise<Inspection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inspections")
    .select("*")
    .lt("date", todayInOslo())
    .order("date", { ascending: false })
    .order("time", { ascending: false });
  return (data as Inspection[] | null) ?? [];
}

// Today and later, oldest first — the days that still affect the website.
export async function getAvailabilityDays(): Promise<AvailabilityDay[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability_days")
    .select("id, date, is_closed, slots")
    .gte("date", todayInOslo())
    .order("date", { ascending: true });
  return (data as AvailabilityDay[] | null) ?? [];
}

// Everything before today, newest first.
export async function getPastAvailabilityDays(): Promise<AvailabilityDay[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability_days")
    .select("id, date, is_closed, slots")
    .lt("date", todayInOslo())
    .order("date", { ascending: false });
  return (data as AvailabilityDay[] | null) ?? [];
}
