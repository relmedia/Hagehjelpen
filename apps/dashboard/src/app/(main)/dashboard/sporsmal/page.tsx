import Link from "next/link";

import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFaqItems } from "@/lib/content";
import { deleteFaqItem } from "@/server/content-actions";

import { DeleteContentButton } from "../_components/delete-content-button";

export default async function SporsmalPage() {
  const items = await getFaqItems();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Spørsmål og svar</h1>
          <p className="text-muted-foreground text-sm">
            Spørsmålene i FAQ-seksjonen. De brukes også som structured data, så gode svar hjelper i Google.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sporsmal/new">
            <Plus className="size-4" />
            Nytt spørsmål
          </Link>
        </Button>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Spørsmål</TableHead>
              <TableHead className="hidden lg:table-cell">Svar</TableHead>
              <TableHead className="hidden md:table-cell w-40">Kategori</TableHead>
              <TableHead className="w-24 text-center">Synlig</TableHead>
              <TableHead className="w-20 text-center">Rekkefølge</TableHead>
              <TableHead className="w-28 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  Ingen spørsmål ennå. Klikk «Nytt spørsmål» for å komme i gang.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/sporsmal/${item.id}`} className="hover:underline">
                    {item.question}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground hidden max-w-96 truncate lg:table-cell" title={item.answer}>
                  {item.answer}
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{item.category ?? "—"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.published ? "default" : "outline"}>
                    {item.published ? "På nett" : "Skjult"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{item.order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/sporsmal/${item.id}`}>Rediger</Link>
                    </Button>
                    <DeleteContentButton id={item.id} label={item.question} action={deleteFaqItem} />
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
