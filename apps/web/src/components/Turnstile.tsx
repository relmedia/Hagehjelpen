"use client";

import { useEffect, useRef } from "react";

const SCRIPT_ID = "cf-turnstile";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileOptions = {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

/** Skriptet lastes én gang for hele siden, uansett hvor mange widgets som
 *  monteres. Turnstile legger seg på window.turnstile når det er klart. */
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile lastet ikke.")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile lastet ikke."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function Turnstile({
  siteKey,
  onToken,
  onError,
  className,
}: {
  readonly siteKey: string;
  readonly onToken: (token: string | null) => void;
  readonly onError?: () => void;
  readonly className?: string;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onToken, onError });

  useEffect(() => {
    handlers.current = { onToken, onError };
  }, [onToken, onError]);

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return;

        widgetId = window.turnstile.render(holder.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          callback: (token) => handlers.current.onToken(token),
          // Tokenet varer i fem minutter. Går det ut mens skjemaet fylles
          // ut, henter widgeten et nytt via denne runden.
          "expired-callback": () => handlers.current.onToken(null),
          "error-callback": () => {
            handlers.current.onToken(null);
            handlers.current.onError?.();
          },
        });
      })
      .catch(() => {
        if (!cancelled) handlers.current.onError?.();
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey]);

  return <div ref={holder} className={className} />;
}
