"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveLeadNote } from "@/server/lead-actions";

export function LeadNote({ id, note }: { readonly id: string; readonly note: string | null }) {
  const [value, setValue] = useState(note ?? "");
  const [isPending, startTransition] = useTransition();

  const isDirty = value.trim() !== (note ?? "").trim();

  const onSave = () => {
    startTransition(async () => {
      const result = await saveLeadNote(id, value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Notatet er lagret.");
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs">Internt notat</span>
      <Textarea
        aria-label="Internt notat"
        rows={3}
        value={value}
        placeholder="Ringt 12.05, sender tilbud på installasjon med kantsikring …"
        onChange={(event) => setValue(event.target.value)}
      />
      <div>
        <Button size="sm" variant="outline" disabled={isPending || !isDirty} onClick={onSave}>
          {isPending ? "Lagrer …" : "Lagre notat"}
        </Button>
      </div>
    </div>
  );
}
