// lib/api.js — client-side fetch wrapper
export async function analyze(action, data) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Errore server");
  return json;
}
