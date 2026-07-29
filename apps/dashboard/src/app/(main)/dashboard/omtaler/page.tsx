import Link from "next/link";

import { Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTestimonials } from "@/lib/content";
import { deleteTestimonial } from "@/server/content-actions";

import { DeleteContentButton } from "../_components/delete-content-button";

function Rating({ value }: { readonly value: number | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center justify-center gap-0.5" aria-label={`${value} av 5 stjerner`}>
      {Array.from({ length: value }).map((_, index) => (
        <Star key={index} className="size-3.5 fill-current text-amber-500" />
      ))}
    </span>
  );
}

export default async function OmtalerPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Kundeomtaler</h1>
          <p className="text-muted-foreground text-sm">Omtalene som vises i karusellen på nettsiden.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/omtaler/new">
            <Plus className="size-4" />
            Ny omtale
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kunde</TableHead>
              <TableHead className="hidden md:table-cell">Sted</TableHead>
              <TableHead>Omtale</TableHead>
              <TableHead className="w-28 text-center">Vurdering</TableHead>
              <TableHead className="w-24 text-center">Synlig</TableHead>
              <TableHead className="w-20 text-center">Rekkefølge</TableHead>
              <TableHead className="w-28 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                  Ingen omtaler ennå. Klikk «Ny omtale» for å legge inn den første.
                </TableCell>
              </TableRow>
            )}
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/omtaler/${testimonial.id}`} className="hover:underline">
                    {testimonial.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {testimonial.place ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-96 truncate" title={testimonial.quote}>
                  {testimonial.quote}
                </TableCell>
                <TableCell className="text-center">
                  <Rating value={testimonial.rating} />
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={testimonial.published ? "default" : "outline"}>
                    {testimonial.published ? "På nett" : "Skjult"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{testimonial.order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/omtaler/${testimonial.id}`}>Rediger</Link>
                    </Button>
                    <DeleteContentButton
                      id={testimonial.id}
                      label={testimonial.name}
                      action={deleteTestimonial}
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
