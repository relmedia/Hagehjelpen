import { getArchivedLeads } from "@/lib/leads";

import { LeadTable } from "../_components/lead-table";

export default async function HenvendelserArkivPage() {
  const leads = await getArchivedLeads();

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Arkiverte henvendelser</h1>
        <p className="text-muted-foreground text-sm">
          Henvendelser som er vunnet eller tapt. Sett status tilbake til «Kontaktet» for å ta dem opp igjen.
        </p>
      </div>

      <LeadTable leads={leads} emptyMessage="Ingen arkiverte henvendelser ennå." />
    </div>
  );
}
