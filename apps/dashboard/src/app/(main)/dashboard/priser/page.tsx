import Link from "next/link";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPriceTiers } from "@/lib/content";
import { deletePriceTier } from "@/server/content-actions";
import type { PriceTier } from "@/types/content";

import { DeleteContentButton } from "../_components/delete-content-button";

function areaLabel(tier: PriceTier): string {
  const min = tier.min_area?.toLocaleString("nb-NO");
  const max = tier.max_area?.toLocaleString("nb-NO");
  if (min && max) return `${min}–${max} m²`;
  if (min) return `over ${min} m²`;
  if (max) return `opp til ${max} m²`;
  return "—";
}

export default async function PriserPage() {
  const tiers = await getPriceTiers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Priser</h1>
          <p className="text-muted-foreground text-sm">
            Prisnivåene for installasjon. Arealintervallene brukes av plenkalkulatoren til å regne ut estimatet.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/priser/new">
            <Plus className="size-4" />
            Nytt prisnivå
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead className="w-40">Areal</TableHead>
              <TableHead className="w-32 text-right">Pris</TableHead>
              <TableHead className="hidden lg:table-cell">Inkludert</TableHead>
              <TableHead className="w-24 text-center">Synlig</TableHead>
              <TableHead className="w-28 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  Ingen prisnivåer ennå. Klikk «Nytt prisnivå» for å komme i gang.
                </TableCell>
              </TableRow>
            )}
            {tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/priser/${tier.id}`} className="hover:underline">
                    {tier.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{areaLabel(tier)}</TableCell>
                <TableCell className="text-right">
                  {tier.price ? `${tier.price.toLocaleString("nb-NO")} kr` : "Etter befaring"}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {tier.includes?.length ? `${tier.includes.length} punkter` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={tier.active ? "default" : "outline"}>{tier.active ? "På nett" : "Skjult"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/priser/${tier.id}`}>Rediger</Link>
                    </Button>
                    <DeleteContentButton id={tier.id} label={tier.title} action={deletePriceTier} />
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
