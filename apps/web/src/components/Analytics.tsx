"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackAction, trackEngaged, trackSection, trackView } from "@/lib/track";

/** Sekunder på siden før besøket regnes som engasjert. */
const ENGAGED_AFTER_MS = 10_000;

/** Sender sidevisning, engasjement, hvilke seksjoner som blir sett og klikk på
 *  telefonnummer. Siden er én lang forside, så seksjonene er det som viser hvor
 *  langt ned folk faktisk kommer. */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    trackView(pathname);

    const timer = window.setTimeout(() => {
      // Er fanen skjult, har ingen egentlig vært på siden i ti sekunder.
      if (document.visibilityState !== "visible") return;
      trackEngaged(pathname);
    }, ENGAGED_AFTER_MS);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // Et par piksler nederst i vinduet er ikke det samme som å ha sett
          // seksjonen, så vi krever halve seksjonen eller en god del av skjermen.
          const needed = Math.min(entry.boundingClientRect.height * 0.5, window.innerHeight * 0.3);
          if (entry.intersectionRect.height < needed) continue;
          trackSection(pathname, entry.target.id);
          observer.unobserve(entry.target);
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );

    for (const section of document.querySelectorAll<HTMLElement>("section[id]")) {
      observer.observe(section);
    }

    // Ett lytt for alle telefonlenkene på siden, i stedet for i hver komponent.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.('a[href^="tel:"]');
      if (link) trackAction("telefon");
    };
    document.addEventListener("click", onClick);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return null;
}
