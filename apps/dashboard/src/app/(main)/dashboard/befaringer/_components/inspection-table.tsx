"use client";

import { Fragment, useMemo, useState } from "react";

import { ChevronRight, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseAvailabilityDate } from "@/lib/availability";
import { cn } from "@/lib/utils";
import { deleteInspection } from "@/server/booking-actions";
import type { Inspection, InspectionStatus } from "@/types/booking";
import { serviceLabel } from "@/types/lead";

import { DeleteContentButton } from "../../_components/delete-content-button";

import { InspectionActions } from "./inspection-actions";

type StatusFilter = "all" | InspectionStatus;

const STATUS_LABELS: Record<InspectionStatus, string> = {
  pending: "Venter",
  confirmed: "Bekreftet",
  cancelled: "Avbestilt",
};

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "Alle statuser",
  pending: "Venter",
  confirmed: "Bekreftet",
  cancelled: "Avbestilt",
};

function formatDate(value: string): string {
  const date = parseAvailabilityDate(value);
  if (!date) return value;
  return date.toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  return phone;
}

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

function fullAddress(inspection: Inspection): string {
  return [inspection.address, inspection.postal_code]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

function StatusBadge({ status }: { readonly status: InspectionStatus }) {
  const variant = status === "confirmed" ? "default" : status === "cancelled" ? "outline" : "secondary";
  return <Badge variant={variant}>{STATUS_LABELS[status] ?? status}</Badge>;
}

// Everything an inspection can be searched by, including the date in ISO,
// dotted and Norwegian form.
function searchable(inspection: Inspection): string {
  const parsed = parseAvailabilityDate(inspection.date);
  const dotted = parsed
    ? `${String(parsed.getDate()).padStart(2, "0")}.${String(parsed.getMonth() + 1).padStart(2, "0")}.${parsed.getFullYear()}`
    : "";
  return [
    inspection.first_name,
    inspection.last_name,
    inspection.email,
    inspection.phone,
    formatPhone(inspection.phone),
    inspection.address ?? "",
    inspection.postal_code ?? "",
    serviceLabel(inspection.service),
    inspection.date,
    dotted,
    formatDate(inspection.date),
    inspection.time,
    inspection.message ?? "",
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

export function InspectionTable({
  inspections,
  emptyMessage,
}: {
  readonly inspections: Inspection[];
  readonly emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hasFilters = query.trim() !== "" || status !== "all";

  const visibleInspections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inspections.filter((inspection) => {
      if (needle && !searchable(inspection).includes(needle)) return false;
      if (status !== "all" && inspection.status !== status) return false;
      return true;
    });
  }, [inspections, query, status]);

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
            aria-label="Søk i befaringer"
            placeholder="Søk på navn, adresse, telefon eller dato"
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
            {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_FILTER_LABELS[value]}
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
          Viser {visibleInspections.length} av {inspections.length}{" "}
          {inspections.length === 1 ? "befaring" : "befaringer"}
        </span>
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Dato og tid</TableHead>
              <TableHead>Navn</TableHead>
              <TableHead className="hidden lg:table-cell">Kontakt</TableHead>
              <TableHead className="hidden md:table-cell">Adresse</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="w-56 text-right">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleInspections.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                  {inspections.length === 0 ? emptyMessage : "Ingen befaringer passer søket eller filteret."}
                </TableCell>
              </TableRow>
            )}
            {visibleInspections.map((inspection) => {
              const isExpanded = expandedId === inspection.id;
              const fullName = `${inspection.first_name} ${inspection.last_name}`;

              return (
                <Fragment key={inspection.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Skjul detaljer" : "Vis detaljer"}
                        onClick={() => setExpandedId(isExpanded ? null : inspection.id)}
                      >
                        <ChevronRight className={cn("size-4 transition-transform", isExpanded && "rotate-90")} />
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(inspection.date)}
                      <span className="text-muted-foreground"> kl. {inspection.time}</span>
                    </TableCell>
                    <TableCell>
                      <div>{fullName}</div>
                      {inspection.message && (
                        <p
                          className="text-muted-foreground mt-0.5 max-w-72 truncate text-xs"
                          title={inspection.message}
                        >
                          {inspection.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden lg:table-cell">
                      <div className="text-xs">
                        <div>{inspection.email}</div>
                        <div>{formatPhone(inspection.phone)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">
                      {fullAddress(inspection) || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={inspection.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <InspectionActions id={inspection.id} status={inspection.status} />
                        <DeleteContentButton id={inspection.id} label={fullName} action={deleteInspection} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="bg-muted/30 whitespace-normal">
                        <div className="grid gap-4 px-2 py-2 sm:grid-cols-2 lg:grid-cols-4">
                          <DetailRow label="Navn">{fullName}</DetailRow>
                          <DetailRow label="Telefon">
                            <a className="hover:underline" href={`tel:${inspection.phone}`}>
                              {formatPhone(inspection.phone)}
                            </a>
                          </DetailRow>
                          <DetailRow label="E-post">
                            <a className="break-all hover:underline" href={`mailto:${inspection.email}`}>
                              {inspection.email}
                            </a>
                          </DetailRow>
                          <DetailRow label="Tjeneste">{serviceLabel(inspection.service)}</DetailRow>
                          <DetailRow label="Adresse">
                            {inspection.address?.trim() ? (
                              <a
                                className="hover:underline"
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  fullAddress(inspection),
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {fullAddress(inspection)}
                              </a>
                            ) : (
                              "—"
                            )}
                          </DetailRow>
                          <DetailRow label="Oppgitt plen">
                            {inspection.lawn_area ? `${inspection.lawn_area.toLocaleString("nb-NO")} m²` : "—"}
                          </DetailRow>
                          <DetailRow label="Befaring">
                            {formatDate(inspection.date)} kl. {inspection.time}
                          </DetailRow>
                          <DetailRow label="Mottatt">{formatTimestamp(inspection.created_at)}</DetailRow>
                          <DetailRow label="Bekreftet">{formatTimestamp(inspection.confirmed_at)}</DetailRow>
                          <DetailRow label="Avbestilt">{formatTimestamp(inspection.cancelled_at)}</DetailRow>
                          <div className="sm:col-span-2 lg:col-span-4">
                            <DetailRow label="Melding">{inspection.message?.trim() || "—"}</DetailRow>
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
