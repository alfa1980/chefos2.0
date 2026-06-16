// components/Auth.js
// Login/registrazione semplice via email+password con Supabase Auth.
// Mostra anche i crediti residui dell'utente loggato.

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Btn, Lbl } from "./ui";

export function useAuth() {
  const [session, setSession] = useState(undefined); // undefined = ancora in caricamento
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("ristorante_nome, piano, crediti_residui, crediti_totali_piano, abbonamento_attivo")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  return { session, profile, loading: session === undefined };
}

export function AuthGate({ children }) {
  const { session, profile, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;

  if (!session) {
    const submit = async (e) => {
      e.preventDefault();
      setBusy(true); setMsg("");
      const { error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      setBusy(false);
    };

    return (
      <div style={{ maxWidth: 360, margin: "80px auto", padding: 24 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: 3, color: "var(--accent)", marginBottom: 6 }}>CHEF OS</div>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 18 }}>{mode === "login" ? "Accedi" : "Crea il tuo account"}</h2>
        <form onSubmit={submit}>
          <Lbl>Email</Lbl>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: 14, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: 14 }} />
          <Lbl>Password</Lbl>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 18, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: 14 }} />
          {msg && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{msg}</div>}
          <Btn disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Attendere…" : mode === "login" ? "Accedi" : "Registrati"}
          </Btn>
        </form>
        <div style={{ marginTop: 16, fontSize: 13, textAlign: "center" }}>
          <a onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ cursor: "pointer", color: "var(--accent)" }}>
            {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
          </a>
        </div>
      </div>
    );
  }

  return children({ session, profile });
}

export function CreditiBadge({ profile }) {
  if (!profile) return null;
  const basso = profile.crediti_residui <= 3;
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: basso ? "var(--danger)" : "var(--text-soft)" }}>
      {profile.crediti_residui}/{profile.crediti_totali_piano} richieste rimaste
    </span>
  );
}
