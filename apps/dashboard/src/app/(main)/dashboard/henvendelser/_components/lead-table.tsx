"use client";

import { Fragment, useMemo, useState } from "react";

import { ChevronRight, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { deleteLead } from "@/server/lead-actions";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
  lawnSizeLabel,
  mowerLabel,
  serviceLabel,
  sourceLabel,
} from "@/types/lead";

import { DeleteContentButton } from "../../_components/delete-content-button";

import { LeadNote } from "./lead-note";
import { LeadStatusSelect } from "./lead-status-select";

type StatusFilter = "all" | LeadStatus;

const BADGE_VARIANTS: Record<LeadStatus, "default" | "secondary" | "outline"> = {
  ny: "default",
  kontaktet: "secondary",
  tilbud: "secondary",
  vunnet: "default",
  tapt: "outline",
};

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  return phone;
}

// Measured area beats the coarse dropdown range when the customer used the
// lawn calculator.
function lawnLabel(lead: Lead): string {
  if (lead.lawn_area) return `${lead.lawn_area.toLocaleString("nb-NO")} m²`;
  return lawnSizeLabel(lead.lawn_size);
}

function searchable(lead: Lead): string {
  return [
    lead.name,
    lead.email,
    lead.phone,
    formatPhone(lead.phone),
    lead.address ?? "",
    serviceLabel(lead.service),
    lawnLabel(lead),
    mowerLabel(lead.mower),
    lead.message ?? "",
    lead.note ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function DetailRow({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

export function LeadTable({
  leads,
  emptyMessage,
}: {
  readonly leads: Lead[];
  readonly emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hasFilters = query.trim() !== "" || status !== "all";

  const visibleLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (needle && !searchable(lead).includes(needle)) return false;
      if (status !== "all" && lead.status !== status) return false;
      return true;
    });
  }, [leads, query, status]);

  const resetFilters = () => {
    setQuery("");
    setStatus("all");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="h-9 w-full sm:w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Søk i henvendelser"
            placeholder="Søk på navn, e-post, telefon eller adresse"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Tøm søk" onClick={() => setQuery("")}>
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
          <SelectTrigger aria-label="Filtrer på status" className="h-9 w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statuser</SelectItem>
            {LEAD_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {LEAD_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={resetFilters}>
            Nullstill
          </Button>
        )}

        <span className="text-muted-foreground ml-auto text-xs">
          Viser {visibleLeads.length} av {leads.length} {leads.length === 1 ? "henvendelse" : "henvendelser"}
        </span>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Mottatt</TableHead>
              <TableHead>Navn</TableHead>
              <TableHead className="hidden lg:table-cell">Kontakt</TableHead>
              <TableHead className="hidden md:table-cell">Tjeneste</TableHead>
              <TableHead className="hidden xl:table-cell">Plen</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="w-52 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  {leads.length === 0 ? emptyMessage : "Ingen henvendelser passer søket eller filteret."}
                </TableCell>
              </TableRow>
            )}
            {visibleLeads.map((lead) => {
              const isExpanded = expandedId === lead.id;

              return (
                <Fragment key={lead.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Skjul detaljer" : "Vis detaljer"}
                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                      >
                        <ChevronRight className={cn("size-4 transition-transform", isExpanded && "rotate-90")} />
                      </Button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{formatTimestamp(lead.created_at)}</TableCell>
                    <TableCell>
                      <div>{lead.name}</div>
                      {lead.message && (
                        <p className="text-muted-foreground mt-0.5 max-w-72 truncate text-xs" title={lead.message}>
                          {lead.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      <div className="text-xs">
                        <div>{lead.email}</div>
                        <div>{formatPhone(lead.phone)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {serviceLabel(lead.service)}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden xl:table-cell">{lawnLabel(lead)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={BADGE_VARIANTS[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <LeadStatusSelect id={lead.id} status={lead.status} />
                        <DeleteContentButton id={lead.id} label={lead.name} action={deleteLead} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={8} className="bg-muted/30 whitespace-normal">
                        <div className="grid gap-4 px-2 py-2 sm:grid-cols-2 lg:grid-cols-4">
                          <DetailRow label="Telefon">
                            <a className="hover:underline" href={`tel:${lead.phone}`}>
                              {formatPhone(lead.phone)}
                            </a>
                          </DetailRow>
                          <DetailRow label="E-post">
                            <a className="break-all hover:underline" href={`mailto:${lead.email}`}>
                              {lead.email}
                            </a>
                          </DetailRow>
                          <DetailRow label="Adresse">{lead.address?.trim() || "—"}</DetailRow>
                          <DetailRow label="Kilde">{sourceLabel(lead.source)}</DetailRow>
                          <DetailRow label="Tjeneste">{serviceLabel(lead.service)}</DetailRow>
                          <DetailRow label="Plen">{lawnLabel(lead)}</DetailRow>
                          <DetailRow label="Klipper">{mowerLabel(lead.mower)}</DetailRow>
                          <DetailRow label="Bilder">
                            {lead.image_count ? `${lead.image_count} vedlagt` : "Ingen"}
                          </DetailRow>
                          <DetailRow label="Mottatt">{formatTimestamp(lead.created_at)}</DetailRow>
                          <DetailRow label="Avsluttet">{formatTimestamp(lead.handled_at)}</DetailRow>
                          <div className="sm:col-span-2 lg:col-span-4">
                            <DetailRow label="Melding">{lead.message?.trim() || "—"}</DetailRow>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-4">
                            <LeadNote id={lead.id} note={lead.note} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
