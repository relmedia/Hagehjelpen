"use client";

import { useTransition } from "react";

import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setLeadStatus } from "@/server/lead-actions";
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from "@/types/lead";

export function LeadStatusSelect({ id, status }: { readonly id: string; readonly status: LeadStatus }) {
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const next = value as LeadStatus;
    startTransition(async () => {
      const result = await setLeadStatus(id, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Status satt til «${LEAD_STATUS_LABELS[next]}».`);
    });
  };

  return (
    <Select value={status} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger aria-label="Endre status" className="h-8 w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {LEAD_STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
