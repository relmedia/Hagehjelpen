import Image from "next/image";
import Link from "next/link";

import { Bot, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMowers } from "@/lib/content";
import { deleteMower } from "@/server/content-actions";

import { DeleteContentButton } from "../_components/delete-content-button";

// unoptimized: images come from Supabase storage, which is not in the next/image domain allowlist.
function Thumbnail({ src, alt }: { readonly src: string | null; readonly alt: string }) {
  if (!src) {
    return (
      <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-md">
        <Bot className="size-5" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={44}
      height={44}
      unoptimized
      className="bg-muted size-11 rounded-md object-cover"
    />
  );
}

export default async function KlipperePage() {
  const mowers = await getMowers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Robotklippere</h1>
          <p className="text-muted-foreground text-sm">
            Modellene vi anbefaler. Areal og helling styrer hva klippeveiviseren foreslår kunden.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/klippere/new">
            <Plus className="size-4" />
            Ny modell
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Bilde</TableHead>
              <TableHead>Modell</TableHead>
              <TableHead className="hidden lg:table-cell">Merke</TableHead>
              <TableHead className="w-28 text-right">Maks areal</TableHead>
              <TableHead className="w-28 text-right">Maks helling</TableHead>
              <TableHead className="w-32 text-right">Veil. pris</TableHead>
              <TableHead className="w-24 text-center">Synlig</TableHead>
              <TableHead className="w-28 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mowers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  Ingen modeller ennå. Klikk «Ny modell» for å komme i gang.
                </TableCell>
              </TableRow>
            )}
            {mowers.map((mower) => (
              <TableRow key={mower.id}>
                <TableCell>
                  <Thumbnail src={mower.image_url} alt={mower.image_alt ?? mower.title} />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/klippere/${mower.id}`} className="hover:underline">
                    {mower.title}
                  </Link>
                  {mower.boundary && (
                    <p className="text-muted-foreground mt-0.5 text-xs font-normal">{mower.boundary}</p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">{mower.brand ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {mower.max_area ? `${mower.max_area.toLocaleString("nb-NO")} m²` : "—"}
                </TableCell>
                <TableCell className="text-right">{mower.max_slope ? `${mower.max_slope} %` : "—"}</TableCell>
                <TableCell className="text-right">
                  {mower.price ? `${mower.price.toLocaleString("nb-NO")} kr` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={mower.active ? "default" : "outline"}>{mower.active ? "På nett" : "Skjult"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/klippere/${mower.id}`}>Rediger</Link>
                    </Button>
                    <DeleteContentButton id={mower.id} label={mower.title} action={deleteMower} />
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
