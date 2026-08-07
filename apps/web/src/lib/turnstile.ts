import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export type TurnstileResult =
  | { ok: true }
  | { ok: false; reason: "missing-token" | "rejected" | "unavailable" };

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET?.trim());
}

/** Sjekker tokenet fra widgeten mot Cloudflare. Er ingen av nøklene satt, er
 *  robotsjekken slått av med vilje, slik at skjemaene virker lokalt og før
 *  nøklene er lagt inn. */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET?.trim();

  if (!secret) {
    // Er sitekeyen satt, vises widgeten til besøkende og de løser den – men
    // uten hemmelig nøkkel blir tokenet aldri sjekket, og skjemaet står i
    // praksis åpent for roboter uten at det synes noe sted. Da avviser vi
    // heller innsendingen, slik at feilen blir oppdaget med en gang.
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) {
      console.error(
        "[turnstile] TURNSTILE_SECRET mangler, men sitekeyen er satt." +
          " Innsendingen avvises fordi tokenet ikke kan verifiseres.",
      );
      return { ok: false, reason: "unavailable" };
    }

    if (process.env.NODE_ENV === "production") {
      console.error("[turnstile] Robotsjekken er slått av i produksjon: ingen nøkler er satt.");
    }

    return { ok: true };
  }

  if (!token) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      console.error("[turnstile] Siteverify svarte", response.status);
      return { ok: false, reason: "unavailable" };
    }

    const result = (await response.json()) as SiteverifyResponse;
    if (result.success) return { ok: true };

    console.warn("[turnstile] Token avvist:", result["error-codes"]?.join(", ") ?? "ukjent årsak");
    return { ok: false, reason: "rejected" };
  } catch (error) {
    console.error("[turnstile] Kunne ikke nå Cloudflare:", error);
    return { ok: false, reason: "unavailable" };
  }
}
