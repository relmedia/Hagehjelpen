import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPriceTier } from "@/lib/content";

import { PriceTierForm } from "../_components/price-tier-form";

export default async function PriceTierEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const tier = isNew ? null : await getPriceTier(id);

  if (!isNew && !tier) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isNew ? "Nytt prisnivå" : "Rediger prisnivå"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Arealintervallet må ikke overlappe med de andre nivåene – kalkulatoren velger første treff.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Opprett prisnivå" : tier?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceTierForm tier={tier} />
        </CardContent>
      </Card>
    </div>
  );
}
