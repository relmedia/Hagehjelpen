import { getOpenLeads } from "@/lib/leads";

import { LeadTable } from "./_components/lead-table";

export default async function HenvendelserPage() {
  const leads = await getOpenLeads();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Henvendelser</h1>
        <p className="text-muted-foreground text-sm">
          Nye forespørsler fra kontaktskjemaet og plenkalkulatoren. Sett status etter hvert som du følger dem
          opp – vunnet og tapt havner i arkivet.
        </p>
      </div>

      <LeadTable
        leads={leads}
        emptyMessage="Ingen åpne henvendelser. Nye forespørsler fra nettsiden dukker opp her."
      />
    </div>
  );
}
