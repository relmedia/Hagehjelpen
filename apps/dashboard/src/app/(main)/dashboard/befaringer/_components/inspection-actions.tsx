"use client";

import { useTransition } from "react";

import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setInspectionStatus } from "@/server/booking-actions";
import type { InspectionStatus } from "@/types/booking";

export function InspectionActions({
  id,
  status,
}: {
  readonly id: string;
  readonly status: InspectionStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const update = (next: InspectionStatus, successMessage: string) => {
    startTransition(async () => {
      const result = await setInspectionStatus(id, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "confirmed"
          ? "Befaringen er bekreftet. Kunden har fått e-post hvis e-post er konfigurert."
          : successMessage,
      );
    });
  };

  return (
    <div className="flex justify-end gap-1">
      {status === "pending" && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => update("confirmed", "Befaringen er bekreftet.")}
        >
          <Check className="size-4" />
          Bekreft
        </Button>
      )}
      {status !== "cancelled" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => update("cancelled", "Befaringen er avbestilt.")}
        >
          <X className="size-4" />
          Avbestill
        </Button>
      )}
      {status === "cancelled" && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => update("pending", "Befaringen er gjenåpnet som venter.")}
        >
          Gjenåpne
        </Button>
      )}
    </div>
  );
}
