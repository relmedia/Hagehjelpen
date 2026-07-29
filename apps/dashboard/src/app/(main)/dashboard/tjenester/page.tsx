import Link from "next/link";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getServices } from "@/lib/content";
import { deleteService } from "@/server/content-actions";

import { DeleteContentButton } from "../_components/delete-content-button";

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  return `fra ${value.toLocaleString("nb-NO")} kr`;
}

export default async function TjenesterPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Tjenester</h1>
          <p className="text-muted-foreground text-sm">
            Installasjon, befaring, service og andre tjenester som vises på nettsiden.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tjenester/new">
            <Plus className="size-4" />
            Ny tjeneste
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tittel</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="w-32">Fra-pris</TableHead>
              <TableHead className="w-24 text-center">Synlig</TableHead>
              <TableHead className="w-20 text-center">Rekkefølge</TableHead>
              <TableHead className="w-28 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  Ingen tjenester ennå. Klikk «Ny tjeneste» for å komme i gang.
                </TableCell>
              </TableRow>
            )}
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/tjenester/${service.id}`} className="hover:underline">
                    {service.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{service.slug}</TableCell>
                <TableCell className="text-muted-foreground">{formatPrice(service.price_from)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={service.active ? "default" : "outline"}>
                    {service.active ? "På nett" : "Skjult"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{service.order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/tjenester/${service.id}`}>Rediger</Link>
                    </Button>
                    <DeleteContentButton id={service.id} label={service.title} action={deleteService} />
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
