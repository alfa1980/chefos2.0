import { useState } from "react";
import Head from "next/head";
import { Card } from "../components/ui";
import StageFornitori from "../components/StageFornitori";
import { StageMenu, StagePresenze, StageOrdini, StageMagazzino, StageReport } from "../components/stages";

const STAGES = [
  { id: "fornitori", short: "Fornitori" },
  { id: "menu",      short: "Menu" },
  { id: "presenze",  short: "Presenze" },
  { id: "ordini",    short: "Ordini" },
  { id: "magazzino", short: "Magazzino" },
  { id: "report",    short: "Report" },
];

export default function Home() {
  const [active, setActive] = useState("fornitori");
  const [fornitori, setFornitori] = useState({});
  const [menu,      setMenu]      = useState({});
  const [presenze,  setPresenze]  = useState({});
  const [ordini,    setOrdini]    = useState({});
  const [magazzino, setMagazzino] = useState({});

  const prog = {
    fornitori: !!fornitori.prezziAnalisi,
    menu:      !!menu.parsed,
    presenze:  !!presenze.parsed,
    ordini:    !!ordini.parsed,
    magazzino: !!magazzino.parsed,
    report:    false,
  };
  const done = Object.values(prog).filter(Boolean).length;
  const total = STAGES.length - 1;

  const stageMap = {
    fornitori: <StageFornitori data={fornitori} setData={setFornitori} />,
    menu:      <StageMenu data={menu} setData={setMenu} />,
    presenze:  <StagePresenze data={presenze} setData={setPresenze} />,
    ordini:    <StageOrdini fornitori={fornitori} menu={menu} presenze={presenze} data={ordini} setData={setOrdini} />,
    magazzino: <StageMagazzino data={magazzino} setData={setMagazzino} />,
    report:    <StageReport ordini={ordini} magazzino={magazzino} presenze={presenze} />,
  };

  const idx = STAGES.findIndex(s => s.id === active);

  return (
    <>
      <Head>
        <title>Chef OS – Gestionale Cucina</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 3, color: "var(--accent)" }}>CHEF OS</span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Gestionale Cucina</span>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
            fornitori → menu → presenze → ordini → magazzino → report
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-soft)" }}>{done}/{total} fasi</span>
          <div style={{ width: 90, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: "var(--accent)", transition: "width .4s", borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Pipeline nav */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "10px 24px", background: "var(--surface)", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", minWidth: "max-content" }}>
          {STAGES.map((s, i) => {
            const isA = active === s.id;
            const isDone = prog[s.id];
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => setActive(s.id)}
                  style={{ background: isA ? "var(--accent)" : isDone ? "var(--success)22" : "var(--surface)", color: isA ? "#000" : isDone ? "var(--success)" : "var(--text-soft)", border: `1px solid ${isA ? "var(--accent)" : isDone ? "var(--success)66" : "var(--border)"}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: isA ? 700 : 500, fontSize: 13, whiteSpace: "nowrap", transition: "all .15s" }}>
                  {isDone && !isA ? "✓ " : ""}{s.short}
                </button>
                {i < STAGES.length - 1 && <div style={{ width: 16, height: 2, background: isDone ? "var(--success)66" : "var(--border)", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "26px 18px" }}>
        <Card>{stageMap[active]}</Card>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
          <button onClick={() => setActive(STAGES[idx - 1].id)} disabled={idx === 0}
            style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 18px", cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.5 : 1, fontSize: 13, fontWeight: 600 }}>
            ← Precedente
          </button>
          <button onClick={() => setActive(STAGES[idx + 1].id)} disabled={idx === STAGES.length - 1}
            style={{ background: idx === STAGES.length - 1 ? "var(--accent-dim)" : "var(--accent)", color: "#000", border: "none", borderRadius: 8, padding: "9px 18px", cursor: idx === STAGES.length - 1 ? "not-allowed" : "pointer", opacity: idx === STAGES.length - 1 ? 0.6 : 1, fontSize: 13, fontWeight: 600 }}>
            Successiva →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px 24px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>Alessandro Facci – Chef Responsabile Vendita Diretta</span>
        <span>Chef OS v2.0 · Powered by Claude AI</span>
      </div>
    </>
  );
}
