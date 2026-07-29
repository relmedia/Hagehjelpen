import { getInspections } from "@/lib/bookings";

import { InspectionTable } from "./_components/inspection-table";

export default async function BefaringerPage() {
  const inspections = await getInspections();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Befaringer</h1>
        <p className="text-muted-foreground text-sm">
          Kommende befaringer bestilt på nettsiden. Bekreft tidspunktet her – kunden får da bekreftelse på
          e-post.
        </p>
      </div>

      <InspectionTable
        inspections={inspections}
        emptyMessage="Ingen kommende befaringer. Nye bestillinger fra nettsiden dukker opp her."
      />
    </div>
  );
}
