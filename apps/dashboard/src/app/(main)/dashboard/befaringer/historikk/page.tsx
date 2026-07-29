import { getPastInspections } from "@/lib/bookings";

import { InspectionTable } from "../_components/inspection-table";

export default async function BefaringerHistorikkPage() {
  const inspections = await getPastInspections();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Tidligere befaringer</h1>
        <p className="text-muted-foreground text-sm">
          Befaringer der datoen har passert. Nyttig når du skal følge opp et tilbud i etterkant.
        </p>
      </div>

      <InspectionTable inspections={inspections} emptyMessage="Ingen tidligere befaringer ennå." />
    </div>
  );
}
