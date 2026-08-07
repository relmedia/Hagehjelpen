import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

/** En dag med tidene som fortsatt er ledige. */
export type BookingDay = {
  date: string;
  slots: string[];
};

type AvailabilityRow = {
  date: string;
  is_closed: boolean;
  slots: unknown;
};

type TakenRow = {
  date: string;
  time: string;
};

/** Vi vil ikke bli bestilt til en befaring som starter om ti minutter. */
const LEAD_TIME_MINUTES = 120;

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

/** Dato og klokkeslett i Norge. Serveren kjører i UTC, så uten dette ville
 *  ledige tider forsvinne en time for tidlig eller for sent. */
function nowInOslo(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    // Døgnskiftet kommer ut som «24» i noen kjøretidsmiljøer.
    minutes: (Number(value("hour")) % 24) * 60 + Number(value("minute")),
  };
}

function readSlots(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((slot): slot is string => typeof slot === "string");
}

/** Dagene besøkende kan velge mellom: det administrator har åpnet, minus
 *  timene som allerede er bestilt og de som er for nære i tid. */
export async function getBookingDays(): Promise<BookingDay[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const now = nowInOslo();

  const [availability, taken] = await Promise.all([
    supabase
      .from("availability_days")
      .select("date, is_closed, slots")
      .gte("date", now.date)
      .eq("is_closed", false)
      .order("date", { ascending: true }),
    supabase
      .from("inspections")
      .select("date, time")
      .gte("date", now.date)
      .neq("status", "cancelled"),
  ]);

  if (availability.error) {
    console.error("[booking] Kunne ikke lese ledige dager:", availability.error.message);
    return [];
  }

  if (taken.error) {
    // Uten denne listen kan vi tilby en time som er opptatt, og da ville to
    // kunder fått samme tidspunkt. Da er det bedre å vise ingenting.
    console.error("[booking] Kunne ikke lese bestilte tider:", taken.error.message);
    return [];
  }

  const occupied = new Set(
    ((taken.data ?? []) as TakenRow[]).map((row) => `${row.date} ${row.time}`),
  );

  return ((availability.data ?? []) as AvailabilityRow[])
    .map((day) => ({
      date: day.date,
      slots: readSlots(day.slots)
        .filter((slot) => !occupied.has(`${day.date} ${slot}`))
        .filter(
          (slot) =>
            day.date > now.date || toMinutes(slot) >= now.minutes + LEAD_TIME_MINUTES,
        )
        .sort(),
    }))
    .filter((day) => day.slots.length > 0);
}

/** Sjekker at tiden faktisk er åpnet og fortsatt ledig. Selve kappløpet mellom
 *  to som bestiller samtidig fanges av den unike indeksen i databasen. */
export async function isSlotBookable(date: string, time: string): Promise<boolean> {
  const days = await getBookingDays();
  return days.some((day) => day.date === date && day.slots.includes(time));
}
