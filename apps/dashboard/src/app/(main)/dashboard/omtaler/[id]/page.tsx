import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTestimonial } from "@/lib/content";

import { TestimonialForm } from "../_components/testimonial-form";

export default async function TestimonialEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const testimonial = isNew ? null : await getTestimonial(id);

  if (!isNew && !testimonial) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isNew ? "Ny omtale" : "Rediger omtale"}
        </h1>
        <p className="text-muted-foreground text-sm">Husk å spørre kunden om lov før du publiserer navn og sted.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Legg til omtale" : testimonial?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialForm testimonial={testimonial} />
        </CardContent>
      </Card>
    </div>
  );
}
