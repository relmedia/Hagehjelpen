"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "sonner";

import { ImagePicker } from "@/components/admin/image-picker";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveService } from "@/server/content-actions";
import type { Service } from "@/types/content";

export function ServiceForm({ service }: { readonly service: Service | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveService(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Tjenesten er lagret.");
      router.push("/dashboard/tjenester");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {service && <input type="hidden" name="id" value={service.id} />}
      <FieldGroup className="gap-5">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="title">Tittel</FieldLabel>
          <Input
            id="title"
            name="title"
            defaultValue={service?.title ?? ""}
            placeholder="Installasjon av robotgressklipper"
            required
          />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
          <Input id="slug" name="slug" defaultValue={service?.slug ?? ""} placeholder="genereres fra tittel" />
          <FieldDescription>La stå tom for å generere automatisk fra tittelen.</FieldDescription>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="short_description">Kort beskrivelse</FieldLabel>
          <Textarea
            id="short_description"
            name="short_description"
            rows={3}
            defaultValue={service?.short_description ?? ""}
          />
          <FieldDescription>Vises i tjenestekortet på forsiden.</FieldDescription>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="body">Utfyllende tekst</FieldLabel>
          <Textarea id="body" name="body" rows={6} defaultValue={service?.body ?? ""} />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel>Bilde</FieldLabel>
          <ImagePicker name="image_url" defaultValue={service?.image_url ?? ""} />
          <FieldDescription>Last opp et bilde eller velg fra biblioteket (valgfritt).</FieldDescription>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="image_alt">Bildebeskrivelse (alt-tekst)</FieldLabel>
            <Input id="image_alt" name="image_alt" defaultValue={service?.image_alt ?? ""} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="price_from">Fra-pris (kr)</FieldLabel>
            <Input
              id="price_from"
              name="price_from"
              type="number"
              min={0}
              step={100}
              defaultValue={service?.price_from ?? ""}
            />
            <FieldDescription>La stå tom hvis prisen avhenger av befaring.</FieldDescription>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="order">Rekkefølge</FieldLabel>
            <Input id="order" name="order" type="number" defaultValue={service?.order ?? 0} />
          </Field>
          <Field orientation="horizontal" className="items-center gap-3 sm:self-end">
            <Switch id="active" name="active" defaultChecked={service?.active ?? true} />
            <div>
              <FieldLabel htmlFor="active" className="font-normal">
                Vis på nettsiden
              </FieldLabel>
              <FieldDescription>Skru av for å skjule tjenesten uten å slette den.</FieldDescription>
            </div>
          </Field>
        </div>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Lagrer …" : "Lagre"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/tjenester">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
