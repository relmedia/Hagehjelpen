"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

const NAV_LINKS = [
  { href: "#fordeler", label: "Fordeler" },
  { href: "#slik-fungerer-det", label: "Slik fungerer det" },
  { href: "#huskeliste", label: "Huskeliste" },
  { href: "#kontakt", label: "Kontakt" },
];

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useGSAP(
    () => {
      // Hvit bakgrunn og mørk tekst fra det øyeblikket hero-pinningen slipper –
      // altså når klipperen er framme til høyre og siden begynner å rulle videre.
      // Vi bytter kun på start-grensa, slik at pillen blir stående hele veien
      // ned til footeren i stedet for å falle av når trigger-området tar slutt.
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

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? "px-4 pt-3" : "px-0 pt-0"
      }`}
    >
      <div
        className={`mx-auto overflow-hidden transition-all duration-300 ${
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
          <a
            href="#"
            onClick={(event) => {
              // Egen håndtering i stedet for #-navigasjon, så vi slipper å legge
              // igjen en tom hash i URL-en
              event.preventDefault();
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3"
            aria-label="Til toppen"
          >
            <Image
              src={scrolled || menuOpen ? "/logo.svg" : "/logo_header.svg"}
              alt="Hagehjelpen – plen og hagetjenester"
              width={205}
              height={108}
              priority
              className={`w-auto transition-all duration-300 ${
                scrolled || menuOpen ? "h-14" : "h-14"
              }`}
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
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Hovedmeny">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-ink-soft hover:text-leaf-600"
                    : "text-white/90 hover:text-leaf-300"
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#kontakt"
              className="rounded-full bg-leaf-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/30 transition-all hover:bg-leaf-600 hover:shadow-leaf-600/30"
            >
              Få et tilbud
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors md:hidden ${
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
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 font-medium text-ink-soft hover:bg-leaf-50 hover:text-leaf-700"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href="#kontakt"
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
