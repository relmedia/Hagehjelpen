import Link from "next/link";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCoverageAreas } from "@/lib/content";
import { deleteCoverageArea } from "@/server/content-actions";
import { COVERAGE_ZONE_LABELS } from "@/types/content";

import { DeleteContentButton } from "../_components/delete-content-button";

export default async function DekningPage() {
  const areas = await getCoverageAreas();
  const core = areas.filter((area) => area.zone === "kjerne").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Dekningsområde</h1>
          <p className="text-muted-foreground text-sm">
            Postnumrene vi kjører ut til. Dette avgjør svaret kunden får i dekningssjekken på nettsiden.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/dekning/new">
            <Plus className="size-4" />
            Nytt postnummer
          </Link>
        </Button>
      </div>

      {areas.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {areas.length} postnummer registrert – {core} i kjerneområdet og {areas.length - core} i utvidet område.
        </p>
      )}

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Postnummer</TableHead>
              <TableHead>Poststed</TableHead>
              <TableHead className="w-40">Sone</TableHead>
              <TableHead className="w-32 text-right">Tillegg</TableHead>
              <TableHead className="hidden lg:table-cell">Merknad</TableHead>
              <TableHead className="w-24 text-center">Aktiv</TableHead>
              <TableHead className="w-28 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                  Ingen postnummer ennå. Legg inn områdene du dekker for at dekningssjekken skal virke.
                </TableCell>
              </TableRow>
            )}
            {areas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-medium tabular-nums">
                  <Link href={`/dashboard/dekning/${area.id}`} className="hover:underline">
                    {area.postal_code}
                  </Link>
                </TableCell>
                <TableCell>{area.place}</TableCell>
                <TableCell>
                  <Badge variant={area.zone === "kjerne" ? "default" : "secondary"}>
                    {COVERAGE_ZONE_LABELS[area.zone]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {area.travel_fee ? `${area.travel_fee.toLocaleString("nb-NO")} kr` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground hidden max-w-72 truncate lg:table-cell">
                  {area.note ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={area.active ? "default" : "outline"}>{area.active ? "Ja" : "Nei"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/dekning/${area.id}`}>Rediger</Link>
                    </Button>
                    <DeleteContentButton
                      id={area.id}
                      label={`${area.postal_code} ${area.place}`}
                      action={deleteCoverageArea}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
