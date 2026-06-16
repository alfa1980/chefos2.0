// lib/supabaseClient.js
// Client Supabase lato browser. Usa la chiave PUBLIC (anon), mai la service role.

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
