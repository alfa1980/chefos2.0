// components/ui.js — shared atoms

export function Btn({ children, onClick, disabled, variant = "primary", style = {} }) {
  const base = {
    border: "none", borderRadius: 8, padding: "9px 18px",
    fontFamily: "var(--sans)", fontWeight: 600, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1, transition: "opacity .15s",
    display: "inline-flex", alignItems: "center", gap: 6,
    ...style,
  };
  if (variant === "primary") return <button onClick={onClick} disabled={disabled} style={{ ...base, background: disabled ? "var(--accent-dim)" : "var(--accent)", color: "#000", border: "1px solid transparent" }}>{children}</button>;
  if (variant === "danger")  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "var(--danger)", color: "#fff", border: "1px solid transparent" }}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{ ...base, background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}>{children}</button>;
}

export function Badge({ children, color = "var(--accent)" }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 10px", fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>{children}</span>;
}

export function Lbl({ children }) {
  return <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}

export function H2({ children }) {
  return <h2 style={{ fontFamily: "var(--sans)", fontSize: 19, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>{children}</h2>;
}

export function Desc({ children }) {
  return <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--text-soft)", margin: "0 0 18px" }}>{children}</p>;
}

export function Spinner() {
  return <span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid var(--border)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />;
}

export function Card({ children, style = {} }) {
  return <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, ...style }}>{children}</div>;
}

export function TA({ value, onChange, placeholder, rows = 7 }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontFamily: "var(--mono)", fontSize: 12, padding: 12, resize: "vertical", outline: "none", lineHeight: 1.6 }} />;
}

export function Out({ text, loading, error }) {
  if (loading) return <div style={{ padding: 18, color: "var(--text-soft)", fontFamily: "var(--sans)", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><Spinner /> Elaborazione AI in corso…</div>;
  if (error) return <div style={{ padding: 14, background: "var(--danger)22", border: "1px solid var(--danger)44", borderRadius: 8, color: "var(--danger)", fontFamily: "var(--mono)", fontSize: 12 }}>⚠ {error}</div>;
  if (!text) return null;
  return <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.7, maxHeight: 400, overflowY: "auto" }}>{text}</div>;
}

export function FilePick({ label, onLoad }) {
  const handle = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    onLoad(text, f.name);
    e.target.value = "";
  };
  return <label style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface2)", border: "1px dashed var(--border)", borderRadius: 8, padding: "8px 13px", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 12, color: "var(--text-soft)" }}>
    📁 {label}<input type="file" accept=".txt,.csv" onChange={handle} style={{ display: "none" }} />
  </label>;
}

export function ExportBtn({ text, filename }) {
  if (!text) return null;
  return <Btn variant="ghost" onClick={() => {
    const b = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = filename;
    a.click();
  }} style={{ fontSize: 12, marginTop: 10 }}>⬇ Esporta TXT</Btn>;
}
