// pages/api/analyze.js
// All Claude calls go through here — API key stays on the server

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

const globalRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 s"),
  prefix: "global",
});

function trunc(s, max = 2000) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "\n[...troncato per lunghezza]" : s;
}

const SYSTEMS = {
  fornitori: "Sei un analista acquisti senior per ristorazione collettiva italiana. Rispondi sempre in italiano con tabelle chiare e raccomandazioni pratiche.",
  menu: "Sei un chef consulente specializzato in food cost per ristorazione collettiva. Rispondi in italiano, preciso con le grammature.",
  presenze: "Sei un analista operativo per ristorazione collettiva. Rispondi in italiano con dati tabellari e commenti pratici.",
  ordini: "Sei un responsabile acquisti senior per ristorazione collettiva. Calcola con precisione, mostra i conti. Rispondi in italiano.",
  magazzino: "Sei un responsabile magazzino per ristorazione professionale. Segnala ogni anomalia. Rispondi in italiano.",
  report: "Sei un controller finanziario specializzato in ristorazione collettiva. Report chiari con numeri e azioni concrete. Italiano.",
};

const PROMPTS = {
  fornitori: (d) => `Analizza questi listini fornitori. Per ogni prodotto crea una tabella comparativa con colonne PRODOTTO | ${Object.keys(d.fornitori || {}).join(" | ")} | MIGLIOR PREZZO. Poi raccomanda quale fornitore preferire per ogni categoria.\n\n${trunc(d.raw, 2500)}`,

  menu: (d) => `Analizza questo menu e ricettario. Per ogni piatto mostra: PIATTO | INGREDIENTE | g/PORZIONE. Poi crea la lista unica di tutti gli ingredienti necessari nell'intera settimana.\n\n---MENU---\n${trunc(d.menu, 1200)}\n\n---RICETTARIO---\n${trunc(d.ricettario, 1200)}`,

  presenze: (d) => `Analizza queste presenze settimanali. Mostra tabella GIORNO | DATA | COPERTI | SCOSTAMENTO DALLA MEDIA. Indica picco, minimo e totale settimanale.\n\n${trunc(d.raw, 800)}`,

  ordini: (d) => `Genera bozza ordini settimanale completa.\n\nLISTINO GREZZO:\n${trunc(d.fornitoriRaw, 1000)}\n\nANALISI PREZZI:\n${trunc(d.prezziAnalisi, 600)}\n\nDISTINTA INGREDIENTI (da menu+ricettario):\n${trunc(d.menuParsed, 800)}\n\nPRESENZE:\n${trunc(d.presenzeParsed, 400)}\n\nREGOLE:\n1. Calcola quantità totale per ingrediente (g/porzione × coperti × giorni)\n2. Aggiungi 10% margine di sicurezza\n3. Scegli fornitore con miglior prezzo (considera qualità se disponibile)\n4. Organizza per fornitore\n5. Merce disponibile almeno ${d.leadTime || 24}h prima del primo utilizzo\n6. Totale per fornitore e totale generale\n\nFormato output:\n=== ORDINE [Fornitore] ===\nData ordine: gg/mm | Consegna: gg/mm\n- Prodotto: Xkg @ €Y/kg = €Z\nTOTALE FORNITORE: €xxx\n\n=== RIEPILOGO COSTI ===\n[tabella fornitore | importo | % sul totale]`,

  magazzino: (d) => `Analizza DDT e scarichi magazzino. Produci:\n1. GIACENZE ATTUALI: entrate DDT meno uscite scarichi per ogni prodotto\n2. ANOMALIE DDT: prodotti con quantità difformi dall'atteso\n3. ALERT: prodotti sotto soglia (meno di 2 giorni di utilizzo stimato)\n4. BOZZA INVENTARIO: tabella PRODOTTO | QTÀ ATTESA | QTÀ DA VERIFICARE | NOTE\n\n---DDT RICEVUTI---\n${trunc(d.ddt, 1200)}\n\n---SCARICHI MAGAZZINO---\n${trunc(d.scarichi, 800)}`,

  report: (d) => `Genera report ${d.periodo} costi e KPI per ristorazione collettiva.\n\nORDINI SETTIMANA:\n${trunc(d.ordini, 800)}\n\nSTATO MAGAZZINO:\n${trunc(d.magazzino, 600)}\n\nPRESENZE:\n${trunc(d.presenze, 400)}\n\nInclude:\n1. FOOD COST: totale settimana e costo per coperto\n2. SCOSTAMENTI: ordinato vs consumato (dove disponibile)\n3. TOP 3 VOCI DI SPESA\n4. TOP 3 SPRECHI IDENTIFICATI\n5. 3 AZIONI DI MIGLIORAMENTO concrete e immediate\n6. KPI: food cost %, costo medio/coperto, indice utilizzo magazzino\n7. SEMAFORO 🟢🟡🔴 per area: Costi / Sprechi / Magazzino / Standard qualità\n\nStile: report esecutivo leggibile anche da chi non conosce i dettagli operativi.`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Devi accedere per usare questa funzione." });

  const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !userData?.user) {
    return res.status(401).json({ error: "Sessione non valida. Accedi di nuovo." });
  }
  const userId = userData.user.id;

  const [userLimit, globalLimit] = await Promise.all([
    ratelimit.limit(userId),
    globalRatelimit.limit("system"),
  ]);

  if (!userLimit.success) {
    return res.status(429).json({ error: "Troppe richieste. Attendi qualche secondo e riprova." });
  }
  if (!globalLimit.success) {
    return res.status(503).json({ error: "Sistema momentaneamente occupato per traffico elevato. Riprova in pochi secondi." });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("crediti_residui, abbonamento_attivo, piano")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: "Profilo non trovato. Contatta il supporto." });
  }
  if (profile.crediti_residui <= 0) {
    return res.status(402).json({
      error: profile.piano === "free"
        ? "Hai esaurito le richieste gratuite del mese. Passa a un piano superiore per continuare."
        : "Hai esaurito i crediti del periodo corrente. Attendi il rinnovo o aggiorna il piano.",
    });
  }

  const { action, data } = req.body;
  if (!PROMPTS[action]) return res.status(400).json({ error: `Azione non riconosciuta: ${action}` });

  try {
    const params = {
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEMS[action] || SYSTEMS.fornitori,
      messages: [{ role: "user", content: PROMPTS[action](data) }],
    };

    const response = await client.messages.create(params);
    const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");

    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .update({ crediti_residui: profile.crediti_residui - 1 })
        .eq("id", userId),
      supabaseAdmin.from("usage_log").insert({
        user_id: userId,
        action,
        tokens_input: response.usage?.input_tokens || null,
        tokens_output: response.usage?.output_tokens || null,
        success: true,
      }),
    ]);

    return res.status(200).json({ result: text, crediti_residui: profile.crediti_residui - 1 });
  } catch (err) {
    console.error("Claude API error:", err);
    await supabaseAdmin.from("usage_log").insert({
      user_id: userId,
      action,
      success: false,
    });
    return res.status(500).json({ error: err.message || "Errore API" });
  }
}
