"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveFaqItem } from "@/server/content-actions";
import type { FaqItem } from "@/types/content";

export function FaqItemForm({ item }: { readonly item: FaqItem | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveFaqItem(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Spørsmålet er lagret.");
      router.push("/dashboard/sporsmal");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {item && <input type="hidden" name="id" value={item.id} />}
      <FieldGroup className="gap-5">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="question">Spørsmål</FieldLabel>
          <Input
            id="question"
            name="question"
            defaultValue={item?.question ?? ""}
            placeholder="Hvor lang tid tar en installasjon?"
            required
          />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="answer">Svar</FieldLabel>
          <Textarea id="answer" name="answer" rows={6} defaultValue={item?.answer ?? ""} required />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="category">Kategori</FieldLabel>
            <Input
              id="category"
              name="category"
              defaultValue={item?.category ?? ""}
              placeholder="Installasjon, pris, service …"
            />
            <FieldDescription>Valgfritt – brukes til å gruppere spørsmålene.</FieldDescription>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="order">Rekkefølge</FieldLabel>
            <Input id="order" name="order" type="number" defaultValue={item?.order ?? 0} />
          </Field>
        </div>
        <Field orientation="horizontal" className="items-center gap-3">
          <Switch id="published" name="published" defaultChecked={item?.published ?? true} />
          <FieldLabel htmlFor="published" className="font-normal">
            Vis på nettsiden
          </FieldLabel>
        </Field>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Lagrer …" : "Lagre"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/sporsmal">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
