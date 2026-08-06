import { readFileSync } from "node:fs";

function readEnv(file) {
  return Object.fromEntries(
    readFileSync(new URL(file, import.meta.url), "utf8")
      .split("\n")
      .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

const env = readEnv("../.env.local");
const base = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = env.SUPABASE_SECRET_KEY;

async function call(path, key, init = {}) {
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  return { status: res.status, body: await res.text() };
}

console.log("--- anon read email_settings ---");
console.log(await call("email_settings?select=email_from", anon));

console.log("\n--- anon read leads ---");
console.log(await call("leads?select=id&limit=1", anon));

console.log("\n--- anon insert lead ---");
const insert = await call("leads", anon, {
  method: "POST",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify({ name: "RLS test", email: "t@example.com", phone: "00", service: "usikker" }),
});
console.log(insert);

console.log("\n--- leads columns (secret) ---");
const cols = await call("leads?select=*&limit=1", secret);
console.log(cols.status, cols.body.slice(0, 400));

console.log("\n--- cleanup ---");
console.log(await call("leads?name=eq.RLS%20test", secret, { method: "DELETE" }));
