import { useState } from "react";
import { Btn, Badge, Lbl, H2, Desc, TA, Out, FilePick, ExportBtn } from "./ui";
import { analyze } from "../lib/api";
import { DEMO } from "../lib/demo";

// ── MENU ─────────────────────────────────────────────────────────────────────
export function StageMenu({ data, setData }) {
  const [menu, setMenu] = useState(data.menu || "");
  const [ric, setRic] = useState(data.ricettario || "");
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");

  const analizza = async () => {
    setL(true); setErr("");
    try {
      const { result } = await analyze("menu", { menu, ricettario: ric });
      setData({ menu, ricettario: ric, parsed: result });
    } catch (e) { setErr(e.message); }
    setL(false);
  };

  return (
    <div>
      <H2>🍽 Menu & Ricettario</H2>
      <Desc>Inserisci il menu settimanale e il ricettario con grammature per porzione.</Desc>
      <Btn variant="ghost" onClick={() => { setMenu(DEMO.menu); setRic(DEMO.ricettario); }} style={{ fontSize: 12, marginBottom: 12 }}>🎯 Carica Demo</Btn>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Lbl>Menu settimanale</Lbl>
          <FilePick label="Carica menu" onLoad={t => setMenu(t)} />
          <div style={{ marginTop: 8 }}><TA value={menu} onChange={setMenu} placeholder={"LUN: Primo | Secondo | Contorno\nMAR: ..."} rows={9} /></div>
        </div>
        <div>
          <Lbl>Ricettario (g/porzione)</Lbl>
          <FilePick label="Carica ricettario" onLoad={t => setRic(t)} />
          <div style={{ marginTop: 8 }}><TA value={ric} onChange={setRic} placeholder={"Piatto (1 porzione): ingrediente Xg, ..."} rows={9} /></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        <Btn onClick={analizza} disabled={!menu.trim() || loading}>{loading ? "⏳ Elaborazione…" : "🍽 Elabora Menu & Ricettario"}</Btn>
        {data.parsed && <Badge color="var(--success)">✓ Ricette indicizzate</Badge>}
      </div>
      {(loading || data.parsed || err) && <div style={{ marginTop: 18 }}><Lbl>Distinta ingredienti</Lbl><Out text={data.parsed} loading={loading} error={err} /></div>}
    </div>
  );
}

// ── PRESENZE ─────────────────────────────────────────────────────────────────
export function StagePresenze({ data, setData }) {
  const [raw, setRaw] = useState(data.raw || "");
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");

  const analizza = async () => {
    setL(true); setErr("");
    try {
      const { result } = await analyze("presenze", { raw });
      setData({ raw, parsed: result });
    } catch (e) { setErr(e.message); }
    setL(false);
  };

  return (
    <div>
      <H2>👥 Presenze Previste</H2>
      <Desc>Inserisci i coperti attesi per ogni giorno della settimana.</Desc>
      <Btn variant="ghost" onClick={() => setRaw(DEMO.presenze)} style={{ fontSize: 12, marginBottom: 12 }}>🎯 Carica Demo</Btn>
      <FilePick label="Carica report presenze" onLoad={t => setRaw(t)} />
      <div style={{ marginTop: 10 }}><TA value={raw} onChange={setRaw} placeholder={"Lunedì 20/01: 185 coperti\n..."} rows={6} /></div>
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        <Btn onClick={analizza} disabled={!raw.trim() || loading}>{loading ? "⏳ Calcolo…" : "👥 Elabora Presenze"}</Btn>
        {data.parsed && <Badge color="var(--success)">✓ Presenze caricate</Badge>}
      </div>
      {(loading || data.parsed || err) && <div style={{ marginTop: 18 }}><Lbl>Analisi presenze</Lbl><Out text={data.parsed} loading={loading} error={err} /></div>}
    </div>
  );
}

// ── ORDINI ────────────────────────────────────────────────────────────────────
export function StageOrdini({ fornitori, menu, presenze, data, setData }) {
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");
  const [lt, setLt] = useState("24");
  const ready = fornitori.prezziAnalisi && menu.parsed && presenze.parsed;

  const genera = async () => {
    setL(true); setErr("");
    try {
      const { result } = await analyze("ordini", {
        fornitoriRaw: fornitori.raw,
        prezziAnalisi: fornitori.prezziAnalisi,
        menuParsed: menu.parsed,
        presenzeParsed: presenze.parsed,
        leadTime: lt,
      });
      setData({ parsed: result, at: new Date().toLocaleTimeString("it-IT") });
    } catch (e) { setErr(e.message); }
    setL(false);
  };

  return (
    <div>
      <H2>🛒 Bozza Ordini Automatica</H2>
      <Desc>Incrocio automatico menu × presenze × fornitori. Ordini divisi per fornitore con date pianificate.</Desc>
      {!ready && (
        <div style={{ background: "var(--accent-dim)33", border: "1px solid var(--accent-dim)", borderRadius: 8, padding: 14, marginBottom: 18, fontSize: 13, color: "var(--accent-light)" }}>
          ⚠️ Completa prima:{!fornitori.prezziAnalisi ? " Fornitori" : ""}{!menu.parsed ? " Menu" : ""}{!presenze.parsed ? " Presenze" : ""}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 18 }}>
        <div>
          <Lbl>Lead time consegna (ore)</Lbl>
          <input type="number" value={lt} onChange={e => setLt(e.target.value)} min="12" max="72"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "8px 12px", fontFamily: "var(--mono)", fontSize: 14, width: 80 }} />
        </div>
        <Badge color={ready ? "var(--success)" : "var(--muted)"}>{ready ? "✓ Dati pronti" : "Dati incompleti"}</Badge>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Btn onClick={genera} disabled={!ready || loading}>{loading ? "⏳ Generazione ordini…" : "🛒 Genera Bozza Ordini"}</Btn>
        {data.at && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>gen. {data.at}</span>}
      </div>
      {(loading || data.parsed || err) && (
        <div style={{ marginTop: 18 }}>
          <Lbl>Ordini per fornitore</Lbl>
          <Out text={data.parsed} loading={loading} error={err} />
          <ExportBtn text={data.parsed} filename={`ordini_${new Date().toISOString().split("T")[0]}.txt`} />
        </div>
      )}
    </div>
  );
}

// ── MAGAZZINO ─────────────────────────────────────────────────────────────────
export function StageMagazzino({ data, setData }) {
  const [ddt, setDdt] = useState(data.ddt || "");
  const [scarichi, setScarichi] = useState(data.scarichi || "");
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");

  const analizza = async () => {
    setL(true); setErr("");
    try {
      const { result } = await analyze("magazzino", { ddt, scarichi });
      setData({ ddt, scarichi, parsed: result });
    } catch (e) { setErr(e.message); }
    setL(false);
  };

  return (
    <div>
      <H2>🏪 Magazzino & DDT</H2>
      <Desc>Carica DDT ricevuti e scarichi. Il sistema verifica conformità, aggiorna le giacenze e genera la bozza inventario.</Desc>
      <Btn variant="ghost" onClick={() => { setDdt(DEMO.ddt); setScarichi(DEMO.scarichi); }} style={{ fontSize: 12, marginBottom: 12 }}>🎯 Carica Demo</Btn>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Lbl>DDT ricevuti</Lbl>
          <FilePick label="Carica DDT" onLoad={t => setDdt(t)} />
          <div style={{ marginTop: 8 }}><TA value={ddt} onChange={setDdt} placeholder={"DDT #001 - Fornitore - data\nProdotto Xkg ✓\nProdotto Ykg ⚠ (mancano Z)"} rows={8} /></div>
        </div>
        <div>
          <Lbl>Scarichi magazzino</Lbl>
          <FilePick label="Carica scarichi" onLoad={t => setScarichi(t)} />
          <div style={{ marginTop: 8 }}><TA value={scarichi} onChange={setScarichi} placeholder={"Lunedì (185 coperti): pasta 22kg, pollo 33kg…"} rows={8} /></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        <Btn onClick={analizza} disabled={(!ddt.trim() && !scarichi.trim()) || loading}>
          {loading ? "⏳ Verifica…" : "🏪 Verifica DDT & Aggiorna Giacenze"}
        </Btn>
        {data.parsed && <Badge color="var(--success)">✓ Magazzino aggiornato</Badge>}
      </div>
      {(loading || data.parsed || err) && <div style={{ marginTop: 18 }}><Lbl>Giacenze, anomalie & bozza inventario</Lbl><Out text={data.parsed} loading={loading} error={err} /></div>}
    </div>
  );
}

// ── REPORT ────────────────────────────────────────────────────────────────────
export function StageReport({ ordini, magazzino, presenze, data, setData }) {
  const [loading, setL] = useState(false);
  const [err, setErr] = useState("");
  const [periodo, setPeriodo] = useState("settimanale");
  const report = data?.report || "";
  const hasData = ordini.parsed || magazzino.parsed;

  const genera = async () => {
    setL(true); setErr(""); 
    try {
      const { result } = await analyze("report", {
        periodo,
        ordini: ordini.parsed || "",
        magazzino: magazzino.parsed || "",
        presenze: presenze.parsed || "",
      });
      setData({ report: result, generated: true, periodo, at: new Date().toLocaleTimeString("it-IT") });
    } catch (e) { setErr(e.message); }
    setL(false);
  };

  return (
    <div>
      <H2>📊 Report Costi & KPI</H2>
      <Desc>Food cost, sprechi, scostamenti e KPI operativi. Seleziona il periodo e genera.</Desc>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["giornaliero", "settimanale", "mensile"].map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            style={{ background: periodo === p ? "var(--accent)" : "var(--surface2)", color: periodo === p ? "#000" : "var(--text-soft)", border: `1px solid ${periodo === p ? "var(--accent)" : "var(--border)"}`, borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 13, fontWeight: periodo === p ? 700 : 400 }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      {!hasData && <div style={{ background: "var(--accent-dim)33", border: "1px solid var(--accent-dim)", borderRadius: 8, padding: 14, marginBottom: 18, fontSize: 13, color: "var(--accent-light)" }}>⚠️ Completa almeno Ordini o Magazzino per un report significativo.</div>}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Btn onClick={genera} disabled={loading}>{loading ? "⏳ Elaborazione…" : `📊 Genera Report ${periodo.charAt(0).toUpperCase() + periodo.slice(1)}`}</Btn>
        {data?.generated && <Badge color="var(--success)">✓ Report generato</Badge>}
      </div>
      {(loading || report || err) && (
        <div style={{ marginTop: 18 }}>
          <Lbl>Report – {periodo}</Lbl>
          <Out text={report} loading={loading} error={err} />
          <ExportBtn text={report} filename={`report_${periodo}_${new Date().toISOString().split("T")[0]}.txt`} />
        </div>
      )}
    </div>
  );
}
