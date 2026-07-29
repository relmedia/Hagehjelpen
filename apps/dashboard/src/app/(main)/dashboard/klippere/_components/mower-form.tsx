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
import { saveMower } from "@/server/content-actions";
import type { Mower } from "@/types/content";

export function MowerForm({ mower }: { readonly mower: Mower | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveMower(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Modellen er lagret.");
      router.push("/dashboard/klippere");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {mower && <input type="hidden" name="id" value={mower.id} />}
      <FieldGroup className="gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="title">Modell</FieldLabel>
            <Input
              id="title"
              name="title"
              defaultValue={mower?.title ?? ""}
              placeholder="Automower 320 NERA"
              required
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="brand">Merke</FieldLabel>
            <Input id="brand" name="brand" defaultValue={mower?.brand ?? ""} placeholder="Husqvarna" />
          </Field>
        </div>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="slug">URL-slug</FieldLabel>
          <Input id="slug" name="slug" defaultValue={mower?.slug ?? ""} placeholder="genereres fra modellnavn" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="max_area">Maks areal (m²)</FieldLabel>
            <Input
              id="max_area"
              name="max_area"
              type="number"
              min={0}
              step={50}
              defaultValue={mower?.max_area ?? ""}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="max_slope">Maks helling (%)</FieldLabel>
            <Input
              id="max_slope"
              name="max_slope"
              type="number"
              min={0}
              max={100}
              defaultValue={mower?.max_slope ?? ""}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="price">Veil. pris (kr)</FieldLabel>
            <Input id="price" name="price" type="number" min={0} step={100} defaultValue={mower?.price ?? ""} />
          </Field>
        </div>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="boundary">Grense</FieldLabel>
          <Input
            id="boundary"
            name="boundary"
            defaultValue={mower?.boundary ?? ""}
            placeholder="Kabelfri – virtuell grense"
          />
          <FieldDescription>
            Hvordan plenen avgrenses, for eksempel «Kabelfri – virtuell grense» eller «Kanttråd».
          </FieldDescription>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="short_description">Kort beskrivelse</FieldLabel>
          <Textarea
            id="short_description"
            name="short_description"
            rows={3}
            defaultValue={mower?.short_description ?? ""}
          />
          <FieldDescription>Én til to setninger om hvem modellen passer for.</FieldDescription>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="features">Egenskaper</FieldLabel>
          <Textarea
            id="features"
            name="features"
            rows={4}
            defaultValue={(mower?.features ?? []).join("\n")}
            placeholder={"GPS-assistert navigasjon\nSystematisk klipping\nStyres fra app"}
          />
          <FieldDescription>Én egenskap per linje – vises som punktliste på nettsiden.</FieldDescription>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="body">Utfyllende tekst</FieldLabel>
          <Textarea id="body" name="body" rows={5} defaultValue={mower?.body ?? ""} />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel>Bilde</FieldLabel>
          <ImagePicker name="image_url" defaultValue={mower?.image_url ?? ""} />
          <FieldDescription>
            Vises i produktvelgeren på forsiden. Produktbilder med hvit eller transparent bakgrunn passer best.
          </FieldDescription>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="image_alt">Bildebeskrivelse (alt-tekst)</FieldLabel>
            <Input id="image_alt" name="image_alt" defaultValue={mower?.image_alt ?? ""} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="order">Rekkefølge</FieldLabel>
            <Input id="order" name="order" type="number" defaultValue={mower?.order ?? 0} />
          </Field>
        </div>
        <Field orientation="horizontal" className="items-center gap-3">
          <Switch id="active" name="active" defaultChecked={mower?.active ?? true} />
          <div>
            <FieldLabel htmlFor="active" className="font-normal">
              Vis på nettsiden
            </FieldLabel>
            <FieldDescription>Skjulte modeller foreslås ikke i klippeveiviseren.</FieldDescription>
          </div>
        </Field>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Lagrer …" : "Lagre"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/klippere">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
