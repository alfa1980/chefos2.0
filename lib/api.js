// lib/api.js — client-side fetch wrapper
import { supabase } from "./supabaseClient";

export async function analyze(action, data) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error("Devi accedere per usare questa funzione.");
  }

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Errore server");
  return json;
}
