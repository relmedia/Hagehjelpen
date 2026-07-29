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
import { saveTestimonial } from "@/server/content-actions";
import type { Testimonial } from "@/types/content";

export function TestimonialForm({ testimonial }: { readonly testimonial: Testimonial | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveTestimonial(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Omtalen er lagret.");
      router.push("/dashboard/omtaler");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <FieldGroup className="gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="name">Navn</FieldLabel>
            <Input id="name" name="name" defaultValue={testimonial?.name ?? ""} placeholder="Kari N." required />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="place">Sted</FieldLabel>
            <Input id="place" name="place" defaultValue={testimonial?.place ?? ""} placeholder="Sola" />
          </Field>
        </div>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="quote">Omtale</FieldLabel>
          <Textarea id="quote" name="quote" rows={5} defaultValue={testimonial?.quote ?? ""} required />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="rating">Stjerner (1–5)</FieldLabel>
            <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="service">Tjeneste</FieldLabel>
            <Input
              id="service"
              name="service"
              defaultValue={testimonial?.service ?? ""}
              placeholder="Installasjon"
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="published_at">Dato</FieldLabel>
            <Input id="published_at" name="published_at" type="date" defaultValue={testimonial?.published_at ?? ""} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="order">Rekkefølge</FieldLabel>
            <Input id="order" name="order" type="number" defaultValue={testimonial?.order ?? 0} />
          </Field>
          <Field orientation="horizontal" className="items-center gap-3 sm:self-end">
            <Switch id="published" name="published" defaultChecked={testimonial?.published ?? true} />
            <div>
              <FieldLabel htmlFor="published" className="font-normal">
                Publisert
              </FieldLabel>
              <FieldDescription>Skru av for å skjule omtalen midlertidig.</FieldDescription>
            </div>
          </Field>
        </div>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Lagrer …" : "Lagre"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/omtaler">Avbryt</Link>
        </Button>
      </div>
    </form>
  );
}
