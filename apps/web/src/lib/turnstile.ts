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
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

/** Sjekker tokenet fra widgeten mot Cloudflare. Uten hemmelig nøkkel er
 *  robotsjekken slått av, slik at skjemaet virker i lokale miljøer og før
 *  nøklene er satt i produksjon. */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { ok: true };

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
