import fs from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const res = await fetch(`${url}/rest/v1/page_views?select=*&limit=3`, { headers });
console.log("page_views:", res.status, (await res.text()).slice(0, 300));

const rpc = await fetch(`${url}/rest/v1/rpc/analytics_summary`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ from_ts: new Date(Date.now() - 86400000).toISOString(), to_ts: new Date().toISOString() }),
});
console.log("analytics_summary:", rpc.status, (await rpc.text()).slice(0, 300));
