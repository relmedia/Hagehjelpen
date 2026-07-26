"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { lawnSizeFromArea, sendContactPrefill } from "@/lib/contact-prefill";
import { CoverageCheck } from "./CoverageCheck";
import { LawnMeasure, type MeasureResult } from "./LawnMeasure";
import { AddressSearch } from "./AddressSearch";
import {
  estimateDrivingKm,
  formatAddress,
  type GeonorgeAddress,
} from "@/lib/geonorge";

const TIERS = [
  { max: 1000, price: 4000, label: "0–1000 m²" },
  { max: 2000, price: 6750, label: "1000–2000 m²" },
  { max: Number.POSITIVE_INFINITY, price: 9250, label: "2000 m² og oppover" },
] as const;

const MAX_AREA = 5000;
const MAX_DISTANCE = 80;
const FREE_ISLANDS = 2;
const ISLAND_PRICE = 250;
const FREE_KM = 15;
const KM_PRICE = 5;
const VAT_RATE = 0.25;

/** Egen tallformatering framfor Intl for å unngå at server og klient
 *  formaterer mellomrommet ulikt ved hydrering. */
function kr(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const sliderClass =
  "h-2 w-full cursor-pointer appearance-none rounded-full bg-leaf-100 accent-leaf-500 outline-none focus-visible:ring-2 focus-visible:ring-leaf-400/40";

export function LawnCalculator() {
  const sectionRef = useRef<HTMLElement>(null);
  const [area, setArea] = useState(800);
  const [islands, setIslands] = useState(2);
  const [distance, setDistance] = useState(10);
  /** Adressen brukeren søkte opp – enten her eller i oppmålingskartet. */
  const [address, setAddress] = useState<GeonorgeAddress>();

  useGSAP(
    () => {
      gsap.fromTo(
        ".calculator-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      gsap.fromTo(
        ".calculator-card",
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".calculator-card", start: "top 85%" },
        },
      );
    },
    { scope: sectionRef },
  );

  const tier = TIERS.find((option) => area <= option.max) ?? TIERS[TIERS.length - 1];
  const extraIslands = Math.max(0, islands - FREE_ISLANDS);
  const islandCost = extraIslands * ISLAND_PRICE;
  const extraKm = Math.max(0, distance - FREE_KM);
  const drivingCost = extraKm * KM_PRICE;
  const exVat = tier.price + islandCost + drivingCost;
  const incVat = exVat * (1 + VAT_RATE);

  /** Fant brukeren adressen sin i kartet, kjenner vi også avstanden. */
  function handleMeasured({
    area: measured,
    distanceKm,
    address: measuredAddress,
  }: MeasureResult) {
    setArea(measured);
    if (distanceKm !== undefined) {
      setDistance(Math.min(distanceKm, MAX_DISTANCE));
    }
    if (measuredAddress) {
      setAddress(measuredAddress);
    }
  }

  function handleSendToForm() {
    sendContactPrefill({
      service: "installasjon",
      lawnSize: lawnSizeFromArea(area),
      message: [
        ...(address ? [`Adresse: ${formatAddress(address)}.`] : []),
        `Estimat fra plenkalkulatoren: ca. ${kr(exVat)} kr eks. mva.`,
        `Plen: ca. ${kr(area)} m².`,
        `Øyer/bed som skal rammes inn: ${islands}.`,
        `Avstand fra Ræge: ca. ${distance} km.`,
      ].join(" "),
    });
  }

  return (
    <section id="kalkulator" ref={sectionRef} className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="calculator-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Prisberegner
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Regn ut hva installasjonen koster
          </h2>
          <p className="mt-4 text-ink-soft">
            Dra i feltene under, så får du et estimat med én gang. Du kan sende
            tallene rett inn i kontaktskjemaet.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="calculator-card gsap-reveal rounded-3xl border border-leaf-100 bg-white p-8 shadow-xl shadow-leaf-900/5 sm:p-10">
            <div className="grid gap-9 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="calc-area" className="text-sm font-medium text-ink">
                    Størrelse på plenen
                  </label>
                  <span className="font-display text-lg font-bold text-leaf-700">
                    {kr(area)} m²
                  </span>
                </div>
                <input
                  id="calc-area"
                  type="range"
                  min={100}
                  max={MAX_AREA}
                  step={50}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className={`mt-4 ${sliderClass}`}
                />
                <div className="mt-2 flex justify-between text-xs text-ink-soft/70">
                  <span>100 m²</span>
                  <span>{kr(MAX_AREA)} m²</span>
                </div>

                <LawnMeasure onApply={handleMeasured} maxArea={MAX_AREA} />
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="calc-islands" className="text-sm font-medium text-ink">
                    Øyer som skal rammes inn
                  </label>
                  <span className="font-display text-lg font-bold text-leaf-700">
                    {islands}
                  </span>
                </div>
                <input
                  id="calc-islands"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={islands}
                  onChange={(e) => setIslands(Number(e.target.value))}
                  className={`mt-4 ${sliderClass}`}
                />
                <p className="mt-2 text-xs text-ink-soft/70">
                  Blomsterbed, trær og lignende. To er inkludert.
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="calc-distance" className="text-sm font-medium text-ink">
                    Avstand fra Ræge
                  </label>
                  <span className="font-display text-lg font-bold text-leaf-700">
                    {distance} km
                  </span>
                </div>
                <input
                  id="calc-distance"
                  type="range"
                  min={0}
                  max={MAX_DISTANCE}
                  step={1}
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className={`mt-4 ${sliderClass}`}
                />
                <AddressSearch
                  id="calc-address"
                  placeholder="Eller søk opp adressen din"
                  ariaLabel="Søk opp adressen din for å beregne avstanden"
                  className="mt-3"
                  autoLocate
                  selected={address}
                  onSelect={(selected) => {
                    setAddress(selected);
                    setDistance(
                      Math.min(
                        estimateDrivingKm(
                          selected.representasjonspunkt.lat,
                          selected.representasjonspunkt.lon,
                        ),
                        MAX_DISTANCE,
                      ),
                    );
                  }}
                />
                <p className="mt-2 text-xs text-ink-soft/70">
                  De første 15 kilometerne er inkludert.
                </p>
              </div>
            </div>

            <dl className="mt-10 space-y-3 border-t border-leaf-100 pt-7 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-soft">Installasjon, {tier.label}</dt>
                <dd className="font-medium text-ink">{kr(tier.price)} kr</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-soft">
                  Innramming av øyer{extraIslands > 0 ? ` (${extraIslands} stk)` : ""}
                </dt>
                <dd className="font-medium text-ink">
                  {islandCost > 0 ? `${kr(islandCost)} kr` : "Inkludert"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-soft">
                  Kjøretillegg{extraKm > 0 ? ` (${extraKm} km)` : ""}
                </dt>
                <dd className="font-medium text-ink">
                  {drivingCost > 0 ? `${kr(drivingCost)} kr` : "Inkludert"}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-leaf-50 px-6 py-5">
              <div>
                <p className="text-sm text-ink-soft">Estimert pris</p>
                <p className="font-display text-3xl font-bold text-ink">
                  {kr(exVat)} kr
                  <span className="ml-2 text-base font-medium text-ink-soft">
                    eks. mva
                  </span>
                </p>
              </div>
              <p className="text-sm text-ink-soft">
                {kr(incVat)} kr inkl. mva
              </p>
            </div>

            <a
              href="#kontakt"
              onClick={handleSendToForm}
              className="mt-6 inline-block rounded-full bg-leaf-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
            >
              Send estimatet til skjemaet
            </a>

            <p className="mt-5 text-xs leading-relaxed text-ink-soft/70">
              Estimatet er veiledende og inkluderer ikke bompassering,
              elektrikerarbeid eller rydding av hindringer i hagen. Endelig pris
              får du etter befaring.
            </p>
          </div>

          <div className="calculator-card gsap-reveal">
            <CoverageCheck />
          </div>
        </div>
      </div>
    </section>
  );
}
