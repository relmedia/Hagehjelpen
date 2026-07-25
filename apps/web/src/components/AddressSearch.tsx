"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { searchAddresses, type GeonorgeAddress } from "@/lib/geonorge";

export function AddressSearch({
  id,
  placeholder = "Søk etter adresse",
  ariaLabel = "Søk etter adresse",
  className,
  onSelect,
}: {
  id: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  onSelect: (address: GeonorgeAddress) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeonorgeAddress[]>([]);
  const [searching, setSearching] = useState(false);
  /** Teksten vi selv skrev inn i feltet ved valg – den skal ikke søkes på nytt. */
  const selectedTerm = useRef<string | null>(null);

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

  function handleSelect(address: GeonorgeAddress) {
    selectedTerm.current = address.adressetekst.trim();
    setQuery(address.adressetekst);
    setResults([]);
    onSelect(address);
  }

  return (
    <div className={cn("relative", className)}>
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
          setQuery(e.target.value);
        }}
        autoComplete="street-address"
        placeholder={placeholder}
        className="w-full rounded-xl border border-leaf-100 bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-shadow placeholder:text-ink-soft/50 focus:border-leaf-400 focus:ring-2 focus:ring-leaf-400/20"
      />

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-1200 mt-1.5 overflow-hidden rounded-xl border border-leaf-100 bg-white py-1 shadow-lg shadow-leaf-900/10">
          {results.map((address) => (
            <li key={`${address.adressetekst}-${address.postnummer}`}>
              <button
                type="button"
                onClick={() => handleSelect(address)}
                className="block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-leaf-50"
              >
                {address.adressetekst}
                <span className="ml-2 text-ink-soft/70">
                  {address.postnummer} {address.poststed}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searching && results.length === 0 && query.trim().length >= 3 && (
        <p className="mt-1.5 text-xs text-ink-soft/70">Søker …</p>
      )}
    </div>
  );
}
