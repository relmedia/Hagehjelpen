"use client";

import { useEffect } from "react";

// Hvor lenge vi holder på seksjonen mens pinning, bilder og fonter faller på plass.
const SETTLE_MS = 1500;

// Taster som flytter siden. Reload-tasten skal ikke telle, for et tastetrykk
// fra forrige side kan lande i den nye før vi er ferdige.
const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/** Peker URL-en på en seksjon, skal siden lande der – også ved reload.
 *  Nettleseren gjenoppretter ellers scrollposisjonen fra forrige besøk, som
 *  kan ligge et helt annet sted enn hashen. */
export function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    const deadline = performance.now() + SETTLE_MS;
    let frame = 0;

    const jump = () => {
      const top = Math.round(target.getBoundingClientRect().top + window.scrollY);
      if (top !== Math.round(window.scrollY)) window.scrollTo({ top });
    };

    // Pinningen i heroen og sen innlasting flytter seksjonen etter at siden er
    // tegnet, så vi følger den til høyden har roet seg.
    const hold = () => {
      jump();

      if (performance.now() < deadline) frame = requestAnimationFrame(hold);
      else release();
    };

    // Begynner besøkeren å scrolle selv, slipper vi taket med én gang.
    const release = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", releaseOnKey);
      history.scrollRestoration = "auto";
    };

    const releaseOnKey = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) release();
    };

    // Nettleseren gjenoppretter ikke posisjonen når vi tar over, så første
    // hopp må skje nå – ellers blir vi stående på toppen om noe avbryter oss.
    history.scrollRestoration = "manual";
    jump();

    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", releaseOnKey);
    frame = requestAnimationFrame(hold);

    return release;
  }, []);

  return null;
}
