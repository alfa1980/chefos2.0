import { useState } from "react";
import { Btn, Badge, Lbl, H2, Desc, TA, Out, FilePick } from "./ui";
import { analyze } from "../lib/api";
import { DEMO } from "../lib/demo";

export default function StageFornitori({ data, setData }) {
  const [raw, setRaw] = useState(data.raw || "");
  const [loadingP, setLP] = useState(false);
  const [errP, setErrP] = useState("");

  const analizzaPrezzi = async () => {
    setLP(true); setErrP("");
    try {
      const { result } = await analyze("fornitori", { raw });
      setData(d => ({ ...d, raw, prezziAnalisi: result, savedAt: new Date().toLocaleTimeString("it-IT") }));
    } catch (e) { setErrP(e.message); }
    setLP(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <H2>📦 Listini Fornitori</H2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.savedAt && <Badge color="var(--success)">💾 Salvato {data.savedAt}</Badge>}
        </div>
      </div>
      <Desc>Carica uno o più listini. Il sistema confronta i prezzi tra fornitori e indica il migliore per categoria.</Desc>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <FilePick label="Carica listino TXT" onLoad={t => setRaw(p => p ? p + "\n\n" + t : t)} />
        <Btn variant="ghost" onClick={() => setRaw(DEMO.fornitori)} style={{ fontSize: 12 }}>🎯 Carica Demo</Btn>
        {raw && <Btn variant="danger" onClick={() => { setRaw(""); setData({}); }} style={{ fontSize: 12, padding: "6px 12px" }}>🗑</Btn>}
      </div>

      <TA value={raw} onChange={setRaw} placeholder={"=== Nome Fornitore ===\nProdotto: €X/kg (Marca)\n..."} rows={9} />

      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
        <Btn onClick={analizzaPrezzi} disabled={!raw.trim() || loadingP}>
          {loadingP ? "⏳ Analisi prezzi…" : "🔍 Confronta Prezzi"}
        </Btn>
        {data.prezziAnalisi && <Badge color="var(--success)">✓ Prezzi</Badge>}
      </div>

      {(loadingP || data.prezziAnalisi || errP) && (
        <div style={{ marginTop: 18 }}>
          <Lbl>Confronto prezzi per prodotto</Lbl>
          <Out text={data.prezziAnalisi} loading={loadingP} error={errP} />
        </div>
      )}
    </div>
  );
}
