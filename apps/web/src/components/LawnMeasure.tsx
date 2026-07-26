"use client";

import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddressSearch } from "./AddressSearch";
import { estimateDrivingKm, type GeonorgeAddress } from "@/lib/geonorge";

import {
  NORKART_ATTRIBUTION,
  NORKART_MAX_ZOOM,
  NORKART_TILE_URL,
} from "@/lib/norkart";

/** Ræge – der Hagehjelpen holder til. */
const DEFAULT_CENTER: [number, number] = [58.8716, 5.5877];
const DEFAULT_ZOOM = 18;

/** Færre punkter enn dette gir ingen flate å regne areal av. */
const MIN_POINTS = 3;

type Point = { lat: number; lng: number };

export type MeasureResult = {
  area: number;
  distanceKm?: number;
  address?: GeonorgeAddress;
};

/** Geodetisk polygonareal (samme formel som Leaflet bruker), i kvadratmeter. */
function polygonArea(points: Point[]) {
  if (points.length < 3) return 0;

  const radius = 6378137;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  let total = 0;

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    total +=
      rad(next.lng - current.lng) *
      (2 + Math.sin(rad(current.lat)) + Math.sin(rad(next.lat)));
  }

  return Math.abs((total * radius * radius) / 2);
}

function formatArea(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function LawnMeasure({
  onApply,
  maxArea,
}: {
  onApply: (result: MeasureResult) => void;
  maxArea: number;
}) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [ready, setReady] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number>();
  const [address, setAddress] = useState<GeonorgeAddress>();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);

  const area = useMemo(() => polygonArea(points), [points]);

  /** Hjelpeteksten forsvinner så snart brukeren har en gyldig flate. */
  const missingPoints = MIN_POINTS - points.length;
  const hint =
    points.length === 0
      ? "Klikk rundt plenen for å sette punkter"
      : missingPoints > 0
        ? `Sett ${missingPoints} punkt${missingPoints > 1 ? "er" : ""} til`
        : null;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        maxZoom: NORKART_MAX_ZOOM,
        doubleClickZoom: false,
        zoomControl: false,
      });

      // Vi beholder krediteringen av flyfotoet, men ikke Leaflets egen lenke.
      map.attributionControl.setPrefix(false);

      L.tileLayer(NORKART_TILE_URL, {
        maxZoom: NORKART_MAX_ZOOM,
        attribution: NORKART_ATTRIBUTION,
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      map.on("click", (event: Leaflet.LeafletMouseEvent) =>
        setPoints((prev) => [...prev, { lat: event.latlng.lat, lng: event.latlng.lng }]),
      );

      leafletRef.current = L;
      mapRef.current = map;
      setReady(true);
      // Dialogen animerer inn, så kartet må måle seg selv på nytt etterpå.
      setTimeout(() => map.invalidateSize(), 80);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
      setReady(false);
    };
  }, [open]);

  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;
    if (!L || !layer) return;

    layer.clearLayers();

    // interactive: false slipper klikkene gjennom til kartet, slik at man kan
    // sette nye punkter oppå det man allerede har tegnet.
    if (points.length > 1) {
      // Hvit strek under den grønne gir kontrast mot mørke flyfoto.
      L.polygon(points, {
        color: "#ffffff",
        weight: 6,
        opacity: 0.55,
        fill: false,
        interactive: false,
      }).addTo(layer);

      L.polygon(points, {
        color: "#65b427",
        weight: 3,
        fillColor: "#84cf45",
        fillOpacity: 0.32,
        interactive: false,
      }).addTo(layer);
    }

    points.forEach((point, index) => {
      L.circleMarker(point, {
        radius: index === 0 ? 7 : 5.5,
        color: "#ffffff",
        weight: 2.5,
        fillColor: index === 0 ? "#2f6b12" : "#4c901c",
        fillOpacity: 1,
        interactive: false,
      }).addTo(layer);
    });
  }, [points, ready]);

  function goToAddress(selected: GeonorgeAddress) {
    const { lat, lon } = selected.representasjonspunkt;
    setAddress(selected);
    setDistanceKm(estimateDrivingKm(lat, lon));
    mapRef.current?.setView([lat, lon], 20);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPoints([]);
      setDistanceKm(undefined);
      setAddress(undefined);
    }
  }

  function handleApply() {
    onApply({ area: Math.min(Math.round(area), maxArea), distanceKm, address });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="group mt-5 flex w-full items-center gap-4 rounded-2xl border border-leaf-100 bg-leaf-50/60 px-5 py-4 text-left transition-colors hover:border-leaf-300 hover:bg-leaf-50">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-leaf-600 shadow-sm">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path
              d="M9 20l-5.4 2.2a.5.5 0 01-.6-.5V5.9a.5.5 0 01.3-.5L9 3m0 17l6 2m-6-2V3m6 19l5.4-2.2a.5.5 0 00.3-.5V3.1a.5.5 0 00-.6-.5L15 4.8m0 17.2V4.8m0 0L9 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <span className="flex-1">
          <span className="block text-sm font-semibold text-ink">
            Vet du ikke størrelsen? Mål den på flyfoto
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
            Søk opp adressen din og klikk rundt plenen – vi regner ut arealet
          </span>
        </span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-leaf-600 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </DialogTrigger>

      <DialogContent className="md:max-w-4xl lg:h-[88vh] lg:max-w-5xl xl:max-w-6xl">
        <div className="flex-none border-b border-leaf-100 px-6 py-5 pr-16 sm:px-8">
          <DialogTitle>Mål opp plenen din</DialogTitle>
          <DialogDescription>
            Søk opp adressen din, og klikk rundt plenen i kartet. Arealet regnes
            ut mens du setter punkter.
          </DialogDescription>
        </div>

        <div className="relative flex-1 overflow-hidden bg-leaf-950/5">
          <div
            ref={containerRef}
            className="lawn-measure-map h-full w-full sm:h-[52vh] sm:min-h-72 lg:h-full"
            aria-label="Kart for oppmåling av plen"
          />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-1000 flex sm:inset-x-4 sm:top-4">
            <AddressSearch
              id="lawn-measure-address"
              placeholder="Søk etter adressen din"
              className="pointer-events-auto mr-12 w-full max-w-sm"
              elevated
              autoLocate
              onSelect={goToAddress}
            />
          </div>

          <div className="absolute right-3 top-3 z-1000 flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white/95 shadow-xl shadow-ink/25 backdrop-blur sm:right-4 sm:top-4">
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              aria-label="Zoom inn"
              className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-leaf-50 hover:text-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <span className="h-px bg-leaf-100" />
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              aria-label="Zoom ut"
              className="flex h-9 w-9 items-center justify-center text-ink-soft transition-colors hover:bg-leaf-50 hover:text-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>

          {hint && (
            <div className="pointer-events-none absolute inset-x-0 bottom-9 z-1000 flex justify-center px-4">
              <p className="flex items-center gap-2 rounded-full bg-ink/85 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-ink/30 backdrop-blur">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-leaf-300"
                  aria-hidden
                >
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
                </svg>
                {hint}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-none flex-wrap items-end justify-between gap-4 border-t border-leaf-100 bg-cream px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft/70">
              Målt areal
            </p>
            <p
              aria-live="polite"
              className="font-display text-3xl font-bold leading-tight text-ink"
            >
              {formatArea(area)}
              <span className="ml-1 text-xl font-semibold text-ink-soft">m²</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {points.length === 0
                ? "Ingen punkter satt ennå"
                : `${points.length} ${points.length === 1 ? "punkt" : "punkter"} satt`}
              {area > maxArea &&
                ` · kalkulatoren stopper på ${formatArea(maxArea)} m²`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPoints((prev) => prev.slice(0, -1))}
              disabled={points.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-leaf-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-leaf-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 8h11a5 5 0 010 10h-4M3 8l4-4M3 8l4 4" />
              </svg>
              Angre
            </button>
            <button
              type="button"
              onClick={() => setPoints([])}
              disabled={points.length === 0}
              className="rounded-full px-3 py-2.5 text-sm font-medium text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline"
            >
              Nullstill
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={points.length < MIN_POINTS}
              className="inline-flex items-center gap-2 rounded-full bg-leaf-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600 disabled:cursor-not-allowed disabled:bg-ink-soft/30 disabled:shadow-none"
            >
              Bruk arealet
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
