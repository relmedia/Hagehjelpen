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
import { savePriceTier } from "@/server/content-actions";
import type { PriceTier } from "@/types/content";

export function PriceTierForm({ tier }: { readonly tier: PriceTier | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await savePriceTier(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Prisnivået er lagret.");
      router.push("/dashboard/priser");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {tier && <input type="hidden" name="id" value={tier.id} />}
      <FieldGroup className="gap-5">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="title">Tittel</FieldLabel>
          <Input id="title" name="title" defaultValue={tier?.title ?? ""} placeholder="Liten hage" required />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="min_area">Fra areal (m²)</FieldLabel>
            <Input id="min_area" name="min_area" type="number" min={0} step={50} defaultValue={tier?.min_area ?? ""} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="max_area">Til areal (m²)</FieldLabel>
            <Input id="max_area" name="max_area" type="number" min={0} step={50} defaultValue={tier?.max_area ?? ""} />
            <FieldDescription>Tom = ingen øvre grense.</FieldDescription>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="price">Pris (kr)</FieldLabel>
            <Input id="price" name="price" type="number" min={0} step={100} defaultValue={tier?.price ?? ""} />
            <FieldDescription>Tom = «etter befaring».</FieldDescription>
          </Field>
        </div>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="includes">Dette er inkludert</FieldLabel>
          <Textarea
            id="includes"
            name="includes"
            rows={5}
            defaultValue={(tier?.includes ?? []).join("\n")}
            placeholder={"Befaring og planlegging\nNedlegging av avgrensningskabel\nMontering av ladestasjon\nOppstart og kalibrering"}
          />
          <FieldDescription>Ett punkt per linje – vises som punktliste i pristabellen.</FieldDescription>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="note">Merknad</FieldLabel>
          <Textarea id="note" name="note" rows={2} defaultValue={tier?.note ?? ""} />
          <FieldDescription>Liten tekst under prisen, for eksempel om tillegg for kompliserte tomter.</FieldDescription>
        </Field>
        <Field className="gap-1.5 sm:max-w-xs">
          <FieldLabel htmlFor="order">Rekkefølge</FieldLabel>
          <Input id="order" name="order" type="number" defaultValue={tier?.order ?? 0} />
        </Field>
        <Field orientation="horizontal" className="items-center gap-3">
          <Switch id="featured" name="featured" defaultChecked={tier?.featured ?? false} />
          <div>
            <FieldLabel htmlFor="featured" className="font-normal">
              Marker som «Mest valgt»
            </FieldLabel>
            <FieldDescription>Kortet får merkelapp og uthevet ramme på nettsiden.</FieldDescription>
          </div>
        </Field>
        <Field orientation="horizontal" className="items-center gap-3">
          <Switch id="active" name="active" defaultChecked={tier?.active ?? true} />
          <FieldLabel htmlFor="active" className="font-normal">
            Vis på nettsiden
          </FieldLabel>
        </Field>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Lagrer …" : "Lagre"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/priser">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
