export {};

const baseUrl = process.env.API_BASE_URL || "http://localhost:8080/api";
const adminSecret = process.env.ADMIN_LICENSE_SECRET;

if (!adminSecret) {
  console.error("ADMIN_LICENSE_SECRET is not set");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--");
const duration = (args[0] as "1month" | "lifetime") || "1month";
const count = Math.min(100, Math.max(1, Number(args[1] || 1)));

if (duration !== "1month" && duration !== "lifetime") {
  console.error("Usage: pnpm generate-licenses [1month|lifetime] [count]");
  process.exit(1);
}

const res = await fetch(`${baseUrl}/licenses/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ count, duration, adminSecret }),
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Generate failed (${res.status}): ${text}`);
  process.exit(1);
}

const data = (await res.json()) as { keys: string[] };
console.log(data.keys.join("\n"));
