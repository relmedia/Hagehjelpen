import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoverageArea } from "@/lib/content";

import { CoverageAreaForm } from "../_components/coverage-area-form";

export default async function CoverageAreaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const area = isNew ? null : await getCoverageArea(id);

  if (!isNew && !area) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isNew ? "Nytt område" : "Rediger område"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Kjerneområdet får svaret «vi dekker deg», utvidet område får beskjed om tillegg for kjøring, og områder
          utenfor vanlig rute blir bedt om å ta kontakt likevel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Legg til område" : area?.place}</CardTitle>
        </CardHeader>
        <CardContent>
          <CoverageAreaForm area={area} />
        </CardContent>
      </Card>
    </div>
  );
}
