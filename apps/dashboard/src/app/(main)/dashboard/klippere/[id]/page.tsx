import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMower } from "@/lib/content";

import { MowerForm } from "../_components/mower-form";

export default async function MowerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const mower = isNew ? null : await getMower(id);

  if (!isNew && !mower) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isNew ? "Ny robotklipper" : "Rediger robotklipper"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Maks areal og maks helling brukes av klippeveiviseren til å foreslå riktig modell.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Opprett modell" : mower?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <MowerForm mower={mower} />
        </CardContent>
      </Card>
    </div>
  );
}
