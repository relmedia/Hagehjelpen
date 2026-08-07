"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

const PRIMARY_NAV = [
  { href: "#installasjon", label: "Installasjon" },
  { href: "#kalkulator", label: "Prisberegner" },
  { href: "#feilsoking", label: "Feilsøking" },
  { href: "#kontakt", label: "Kontakt" },
] as const;

const MORE_NAV = [
  { href: "#fordeler", label: "Fordeler" },
  { href: "#slik-fungerer-det", label: "Slik fungerer det" },
  { href: "#velg-klipper", label: "Velg klipper" },
  { href: "#huskeliste", label: "Huskeliste" },
  { href: "#omtaler", label: "Kundeomtaler" },
  { href: "#faq", label: "Spørsmål og svar" },
  { href: "#befaring", label: "Bestill befaring" },
] as const;

const MOBILE_NAV = [
  ...PRIMARY_NAV,
  ...MORE_NAV,
] as const;

/** `solid` brukes på undersider uten hero: der finnes det ikke noe mørkt bilde
 *  å ligge oppå, så menyen må være hvit fra første piksel. */
export function Header({ solid = false }: { readonly solid?: boolean }) {
  const headerRef = useRef<HTMLElement>(null);
  const onFrontPage = usePathname() === "/";
  const moreRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(solid);

  useGSAP(
    () => {
      if (solid) return;

      ScrollTrigger.create({
        start: () => ScrollTrigger.getById("hero-pin")?.end ?? window.innerHeight,
        invalidateOnRefresh: true,
        onRefresh: (self) => setScrolled(self.scroll() >= self.start),
        onEnter: () => setScrolled(true),
        onLeaveBack: () => setScrolled(false),
      });
    },
    { scope: headerRef },
  );

  useEffect(() => {
    if (!moreOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [moreOpen]);

  const linkClass = scrolled
    ? "text-ink-soft hover:text-leaf-600"
    : "text-white/90 hover:text-leaf-300";

  // Seksjonene ligger på forsiden, så undersider må lenke seg tilbake dit.
  const to = (hash: string) => (onFrontPage ? hash : `/${hash}`);

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "px-4 pt-3" : "px-0 pt-0"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 ${
          scrolled || menuOpen
            ? "max-w-6xl rounded-2xl bg-white/90 shadow-[0_8px_30px_rgba(19,42,10,0.10)] backdrop-blur-md"
            : "max-w-6xl rounded-none bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 transition-all duration-300 ${
            scrolled || menuOpen ? "h-16" : "h-24"
          }`}
        >
          <Link
            href="/"
            onClick={(event) => {
              setMenuOpen(false);
              setMoreOpen(false);
              if (!onFrontPage) return;

              // På forsiden ruller vi til toppen i stedet for å laste på nytt.
              // Uten dette blir hashen fra forrige seksjon liggende i URL-en,
              // og nettleseren tror toppen hører til den seksjonen ved reload.
              event.preventDefault();
              window.history.replaceState(null, "", window.location.pathname);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex shrink-0 items-center gap-3"
            aria-label={onFrontPage ? "Til toppen" : "Til forsiden"}
          >
            <Image
              src={scrolled || menuOpen ? "/logo.svg" : "/logo_header.svg"}
              alt="Hagehjelpen – plen og hagetjenester"
              width={205}
              height={108}
              priority
              className="h-14 w-auto transition-all duration-300"
            />
            <span
              style={{ fontFamily: "var(--font-logo)", transform: "skewX(-10deg)" }}
              className="inline-flex flex-col leading-none"
            >
              <span className="text-2xl font-bold uppercase">
                <span
                  className={`transition-colors duration-300 ${
                    scrolled || menuOpen ? "text-[#333]" : "text-white"
                  }`}
                >
                  Hage
                </span>
                <span className="text-[#9aca42]">hjelpen</span>
              </span>
              <span
                className={`mt-0.5 text-[9px] font-bold uppercase tracking-[0.28em] transition-colors duration-300 ${
                  scrolled || menuOpen ? "text-[#333]" : "text-white/80"
                }`}
              >
                Plen og hage tjenester
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-4 lg:gap-5 md:flex"
            aria-label="Hovedmeny"
          >
            {PRIMARY_NAV.map((link) => (
              <a
                key={link.href}
                href={to(link.href)}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${linkClass}`}
              >
                {link.label}
              </a>
            ))}

            <div
              ref={moreRef}
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium transition-colors ${linkClass}`}
              >
                Mer
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full z-50 pt-2">
                  <div
                    role="menu"
                    className="min-w-48 rounded-xl border border-leaf-100 bg-white py-1.5 shadow-lg shadow-leaf-900/10"
                  >
                    {MORE_NAV.map((link) => (
                      <a
                        key={link.href}
                        href={to(link.href)}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-leaf-50 hover:text-leaf-700"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a
              href={to("#kontakt")}
              className="ml-1 whitespace-nowrap rounded-full bg-leaf-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/30 transition-all hover:bg-leaf-600 hover:shadow-leaf-600/30"
            >
              Få et tilbud
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors md:hidden ${
              scrolled || menuOpen ? "text-ink" : "text-white"
            }`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav
            className="border-t border-leaf-100 px-5 py-4 md:hidden"
            aria-label="Mobilmeny"
          >
            <ul className="flex flex-col gap-1">
              {MOBILE_NAV.map((link) => (
                <li key={link.href}>
                  <a
                    href={to(link.href)}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 font-medium text-ink-soft hover:bg-leaf-50 hover:text-leaf-700"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href={to("#kontakt")}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-full bg-leaf-500 px-5 py-3 text-center font-semibold text-white"
                >
                  Få et tilbud
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
