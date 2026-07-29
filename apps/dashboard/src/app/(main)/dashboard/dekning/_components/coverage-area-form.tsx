"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveCoverageArea } from "@/server/content-actions";
import { COVERAGE_ZONE_LABELS, type CoverageArea, type CoverageZone } from "@/types/content";

export function CoverageAreaForm({ area }: { readonly area: CoverageArea | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [zone, setZone] = useState<CoverageZone>(area?.zone ?? "kjerne");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveCoverageArea(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Området er lagret.");
      router.push("/dashboard/dekning");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {area && <input type="hidden" name="id" value={area.id} />}
      {/* The Select is presentation only – this input is what the form posts. */}
      <input type="hidden" name="zone" value={zone} />
      <FieldGroup className="gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="postal_code">Postnummer</FieldLabel>
            <Input
              id="postal_code"
              name="postal_code"
              inputMode="numeric"
              maxLength={4}
              defaultValue={area?.postal_code ?? ""}
              placeholder="4053"
              required
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="place">Poststed</FieldLabel>
            <Input id="place" name="place" defaultValue={area?.place ?? ""} placeholder="Ræge" required />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="zone-trigger">Sone</FieldLabel>
            <Select value={zone} onValueChange={(value) => setZone(value as CoverageZone)}>
              <SelectTrigger id="zone-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(COVERAGE_ZONE_LABELS) as CoverageZone[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {COVERAGE_ZONE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="travel_fee">Tillegg for kjøring (kr)</FieldLabel>
            <Input
              id="travel_fee"
              name="travel_fee"
              type="number"
              min={0}
              step={50}
              defaultValue={area?.travel_fee ?? ""}
            />
            <FieldDescription>Brukes for utvidet område. Tom = ingen tillegg.</FieldDescription>
          </Field>
        </div>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="note">Merknad</FieldLabel>
          <Textarea id="note" name="note" rows={2} defaultValue={area?.note ?? ""} />
          <FieldDescription>Intern notis, for eksempel «kun etter avtale om ferge».</FieldDescription>
        </Field>
        <Field orientation="horizontal" className="items-center gap-3">
          <Switch id="active" name="active" defaultChecked={area?.active ?? true} />
          <div>
            <FieldLabel htmlFor="active" className="font-normal">
              Aktiv
            </FieldLabel>
            <FieldDescription>Inaktive postnummer gir «utenfor dekning» i sjekken.</FieldDescription>
          </div>
        </Field>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Lagrer …" : "Lagre"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/dekning">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
