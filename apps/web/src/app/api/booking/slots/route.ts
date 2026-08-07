import { NextResponse } from "next/server";

import { getBookingDays } from "@/lib/booking";

// Ledige tider endrer seg hver gang noen bestiller, så svaret må aldri caches.
export const dynamic = "force-dynamic";

export async function GET() {
  const days = await getBookingDays();

  return NextResponse.json(
    { days },
    { headers: { "Cache-Control": "no-store" } },
  );
}
