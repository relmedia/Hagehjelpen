"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STATS = [
  { value: 100, suffix: " %", label: "Elektrisk og utslippsfritt" },
  { value: 65, suffix: " dB", label: "Stillere enn en vanlig samtale" },
  { value: 24, suffix: "/7", label: "Klipper når det passer deg" },
  { value: 0, suffix: " kr", label: "Befaring – helt uforpliktende" },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        },
      );

      // Tallene teller opp når seksjonen kommer til syne
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const target = Number(el.dataset.value ?? 0);
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
          onUpdate: () => {
            el.textContent = String(Math.round(counter.value));
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-item gsap-reveal text-center">
            <p className="font-display text-4xl font-bold text-leaf-600 sm:text-5xl">
              <span className="stat-number" data-value={stat.value}>
                0
              </span>
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
