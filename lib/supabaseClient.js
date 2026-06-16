// lib/supabaseClient.js — VERSIONE DEBUG TEMPORANEA
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined") {
  window.__DEBUG_SUPABASE_URL__ = url;
  window.__DEBUG_SUPABASE_KEY__ = key ? "presente (" + key.length + " caratteri)" : "ASSENTE";
}

export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder");
