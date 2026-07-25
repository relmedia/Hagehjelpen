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

/** Norkart WAAPI har norske flyfoto helt ned til zoom 21. Demonøkkelen under er
 *  Norkarts åpne testnøkkel – sett NEXT_PUBLIC_NORKART_API_KEY til egen nøkkel
 *  fra Norkart før produksjon. */
const NORKART_KEY =
  process.env.NEXT_PUBLIC_NORKART_API_KEY ?? "b8e36d51-119a-423b-b156-d744d54123d5";
const TILE_URL = `https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=${NORKART_KEY}`;
const TILE_ATTRIBUTION = "Flyfoto: © Norkart";
const MAX_ZOOM = 21;

/** Ræge – der Hagehjelpen holder til. */
const DEFAULT_CENTER: [number, number] = [58.8716, 5.5877];
const DEFAULT_ZOOM = 18;

type Point = { lat: number; lng: number };

export type MeasureResult = { area: number; distanceKm?: number };

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

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);

  const area = useMemo(() => polygonArea(points), [points]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        maxZoom: MAX_ZOOM,
        doubleClickZoom: false,
      });

      // Vi beholder krediteringen av flyfotoet, men ikke Leaflets egen lenke.
      map.attributionControl.setPrefix(false);

      L.tileLayer(TILE_URL, {
        maxZoom: MAX_ZOOM,
        attribution: TILE_ATTRIBUTION,
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
      L.polygon(points, {
        color: "#65b427",
        weight: 3,
        fillColor: "#84cf45",
        fillOpacity: 0.35,
        interactive: false,
      }).addTo(layer);
    }

    points.forEach((point) => {
      L.circleMarker(point, {
        radius: 6,
        color: "#ffffff",
        weight: 2,
        fillColor: "#3b6e1a",
        fillOpacity: 1,
        interactive: false,
      }).addTo(layer);
    });
  }, [points, ready]);

  function goToAddress(address: GeonorgeAddress) {
    const { lat, lon } = address.representasjonspunkt;
    setDistanceKm(estimateDrivingKm(lat, lon));
    mapRef.current?.setView([lat, lon], 20);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPoints([]);
      setDistanceKm(undefined);
    }
  }

  function handleApply() {
    onApply({ area: Math.min(Math.round(area), maxArea), distanceKm });
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
        <div className="border-b border-leaf-100 px-6 py-5 pr-16 sm:px-8">
          <DialogTitle>Mål opp plenen din</DialogTitle>
          <DialogDescription>
            Søk opp adressen din, og klikk rundt plenen i kartet. Arealet regnes
            ut mens du setter punkter.
          </DialogDescription>
        </div>

        <div className="border-b border-leaf-100 px-6 py-4 sm:px-8">
          <AddressSearch
            id="lawn-measure-address"
            placeholder="Søk etter adressen din, f.eks. Ølbergvegen 101"
            onSelect={goToAddress}
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            ref={containerRef}
            className="lawn-measure-map h-[46vh] min-h-64 w-full bg-leaf-950/5 lg:h-full"
            aria-label="Kart for oppmåling av plen"
          />

          {points.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-4 z-1000 -translate-x-1/2 rounded-full bg-ink/80 px-4 py-2 text-xs font-medium text-white">
              Klikk i kartet for å sette punkter rundt plenen
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-leaf-100 bg-cream px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-ink-soft/70">
              Målt areal
            </p>
            <p className="font-display text-2xl font-bold text-ink">
              {formatArea(area)} m²
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setPoints((prev) => prev.slice(0, -1))}
              disabled={points.length === 0}
              className="rounded-full border border-leaf-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-leaf-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Angre punkt
            </button>
            <button
              type="button"
              onClick={() => setPoints([])}
              disabled={points.length === 0}
              className="rounded-full border border-leaf-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-leaf-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Nullstill
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={points.length < 3}
              className="rounded-full bg-leaf-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Bruk arealet
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
