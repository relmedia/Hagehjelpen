/**
 * Trafikkmåling mot /api/track. Alt her er «best effort»: feiler et kall, skal
 * det aldri påvirke siden. Se apps/dashboard/supabase/analytics.sql for hva
 * tallene brukes til.
 */

const SESSION_KEY = "hh-session";

type Kind = "view" | "engaged" | "section" | "action";

/** Økten lever i fanen. Ny fane eller nytt besøk gir ny økt. */
function sessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

/** Seksjoner og handlinger telles én gang per økt, ellers ville tall som
 *  «så prisene» vokst hver gang noen ruller opp og ned. */
function firstTimeThisSession(key: string): boolean {
  const marker = `${SESSION_KEY}:${key}`;
  if (sessionStorage.getItem(marker)) return false;
  sessionStorage.setItem(marker, "1");
  return true;
}

function send(kind: Kind, path: string, label?: string) {
  const body = JSON.stringify({
    kind,
    path,
    label,
    sessionId: sessionId(),
    referrer: kind === "view" ? document.referrer : "",
  });

  // keepalive gjør at kallet fullføres selv om besøkende navigerer videre.
  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Statistikk skal aldri påvirke opplevelsen på siden.
  });
}

export function trackView(path: string) {
  if (typeof window === "undefined") return;
  send("view", path);
}

export function trackEngaged(path: string) {
  if (typeof window === "undefined") return;
  if (!firstTimeThisSession("engaged")) return;
  send("engaged", path);
}

export function trackSection(path: string, section: string) {
  if (typeof window === "undefined") return;
  if (!firstTimeThisSession(`section:${section}`)) return;
  send("section", path, section);
}

/**
 * Bruk av verktøyene på siden, for eksempel «kalkulator» eller «skjema-sendt».
 * Navnet må være små bokstaver, tall og bindestrek – ellers avvises det av
 * API-et.
 */
export function trackAction(action: string) {
  if (typeof window === "undefined") return;
  if (!firstTimeThisSession(`action:${action}`)) return;
  send("action", window.location.pathname, action);
}
