import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFaqItem } from "@/lib/content";

import { FaqItemForm } from "../_components/faq-item-form";

export default async function FaqItemEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const item = isNew ? null : await getFaqItem(id);

  if (!isNew && !item) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isNew ? "Nytt spørsmål" : "Rediger spørsmål"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Skriv svaret slik du ville sagt det på telefonen – kort, konkret og uten fagsjargong.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Legg til spørsmål" : item?.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqItemForm item={item} />
        </CardContent>
      </Card>
    </div>
  );
}
