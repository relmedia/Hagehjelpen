"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  findNearestAddress,
  formatAddress,
  formatPlace,
  searchAddresses,
  type GeonorgeAddress,
} from "@/lib/geonorge";

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 5 * 60_000,
};

export function AddressSearch({
  id,
  placeholder = "Søk etter adresse",
  ariaLabel = "Søk etter adresse",
  className,
  selected,
  elevated = false,
  autoLocate = false,
  onSelect,
}: {
  id: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  /** Adresse valgt et annet sted (f.eks. i kartet) – da følger feltet etter. */
  selected?: GeonorgeAddress;
  /** Feltet ligger oppå kartet og trenger slagskygge for å skille seg ut. */
  elevated?: boolean;
  /** Fyller feltet med posisjonen med en gang – kun hvis brukeren allerede har sagt ja. */
  autoLocate?: boolean;
  onSelect: (address: GeonorgeAddress) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeonorgeAddress[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  /** Adressen vi fant via GPS – vises så brukeren kan overprøve den. */
  const [locatedAddress, setLocatedAddress] = useState<string | null>(null);
  /** Teksten vi selv skrev inn i feltet ved valg – den skal ikke søkes på nytt. */
  const selectedTerm = useRef<string | null>(null);
  /** Siste adresse dette feltet sendte ut – den trenger vi ikke ta imot igjen. */
  const emitted = useRef<GeonorgeAddress | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3 || term === selectedTerm.current) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchAddresses(term, controller.signal));
      } catch {
        // Avbrutt søk eller nettverksfeil – vi lar listen stå urørt.
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const selectAddress = useCallback(
    (address: GeonorgeAddress, fromPosition = false) => {
      emitted.current = address;
      selectedTerm.current = address.adressetekst.trim();
      setQuery(address.adressetekst);
      setResults([]);
      setLocateError(null);
      setLocatedAddress(fromPosition ? formatAddress(address) : null);
      onSelectRef.current(address);
    },
    [],
  );

  useEffect(() => {
    if (!selected || selected === emitted.current) return;
    selectedTerm.current = selected.adressetekst.trim();
    setQuery(selected.adressetekst);
    setResults([]);
    setLocateError(null);
    setLocatedAddress(null);
  }, [selected]);

  const locate = useCallback(
    (silent = false) => {
      const fail = (message: string) => {
        setLocating(false);
        if (!silent) setLocateError(message);
      };

      if (!("geolocation" in navigator)) {
        fail("Nettleseren din støtter ikke posisjon. Søk opp adressen i stedet.");
        return;
      }

      setLocateError(null);
      setLocating(true);

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const nearest = await findNearestAddress({
              lat: coords.latitude,
              lon: coords.longitude,
            });
            if (!nearest) {
              fail("Fant ingen adresse der du er nå. Søk opp adressen i stedet.");
              return;
            }
            setLocating(false);
            selectAddress(nearest, true);
          } catch {
            fail("Klarte ikke å hente adressen din. Prøv igjen, eller søk manuelt.");
          }
        },
        (error) =>
          fail(
            error.code === error.PERMISSION_DENIED
              ? "Posisjon er blokkert i nettleseren. Søk opp adressen i stedet."
              : "Fant ikke posisjonen din. Prøv igjen, eller søk opp adressen.",
          ),
        POSITION_OPTIONS,
      );
    },
    [selectAddress],
  );

  useEffect(() => {
    // Vi ber aldri om posisjon uoppfordret – bare gjenbruker et ja som allerede
    // er gitt, slik at feltet er ferdig utfylt neste gang brukeren er innom.
    if (!autoLocate || !navigator.permissions) return;

    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (!cancelled && permission.state === "granted") locate(true);
      })
      .catch(() => {
        // Nettleseren svarer ikke – da lar vi knappen stå klar i stedet.
      });

    return () => {
      cancelled = true;
    };
  }, [autoLocate, locate]);

  const status = locating
    ? { failed: false, text: "Finner posisjonen din …" }
    : locateError
      ? { failed: true, text: locateError }
      : locatedAddress
        ? {
            failed: false,
            text: `Bruker ${locatedAddress}. Ikke riktig? Søk opp adressen over.`,
          }
        : searching && results.length === 0 && query.trim().length >= 3
          ? { failed: false, text: "Søker …" }
          : null;

  return (
    <div className={cn(className)}>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {ariaLabel}
        </label>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            selectedTerm.current = null;
            setLocatedAddress(null);
            setLocateError(null);
            setQuery(e.target.value);
          }}
          autoComplete="street-address"
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-leaf-100 bg-white py-2.5 pl-10 pr-11 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/50 focus:border-leaf-400 focus:ring-2 focus:ring-leaf-400/20",
            elevated && "shadow-xl shadow-ink/25",
          )}
        />
        <button
          type="button"
          onClick={() => locate()}
          disabled={locating}
          aria-label="Bruk min posisjon"
          title="Bruk min posisjon"
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-soft/60 transition-colors hover:bg-leaf-50 hover:text-leaf-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400/40 disabled:cursor-not-allowed disabled:text-leaf-600"
        >
          {locating ? (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="animate-spin"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" className="opacity-25" />
              <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
              <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {results.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-1200 mt-1.5 overflow-hidden rounded-xl border border-leaf-100 bg-white py-1 shadow-lg shadow-leaf-900/10">
            {results.map((address) => (
              <li key={`${address.adressetekst}-${address.postnummer}`}>
                <button
                  type="button"
                  onClick={() => selectAddress(address)}
                  className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-leaf-50"
                >
                  {address.adressetekst}
                  <span className="ml-2 text-ink-soft/70">
                    {address.postnummer} {formatPlace(address.poststed)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status && (
        <p
          aria-live="polite"
          className={cn(
            "mt-1.5 inline-flex text-xs leading-snug",
            // Over kartet trenger teksten sin egen bakgrunn for å være lesbar.
            elevated &&
              "rounded-lg bg-white/95 px-2.5 py-1.5 shadow-lg shadow-ink/20 backdrop-blur",
            status.failed ? "text-red-700" : "text-ink-soft",
          )}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}
