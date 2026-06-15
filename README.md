# Chef OS – Gestionale Cucina
**Alessandro Facci – Chef Responsabile Vendita Diretta**

Sistema integrato per la gestione operativa della cucina:
fornitori → menu → presenze → ordini → magazzino → report

---

## 🚀 Deploy su Vercel (5 minuti)

### 1. Prerequisiti
- Account [GitHub](https://github.com) (gratuito)
- Account [Vercel](https://vercel.com) (gratuito, accedi con GitHub)
- API Key Anthropic: [console.anthropic.com](https://console.anthropic.com)

### 2. Carica il progetto su GitHub

```bash
# Nella cartella chefos/
git init
git add .
git commit -m "Chef OS v2.0"
```

Poi su GitHub: **New repository** → chiama `chefos` → copia i comandi "push existing repository".

### 3. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com) → **Add New Project**
2. Importa il repository `chefos` da GitHub
3. Vercel rileva Next.js automaticamente — non modificare nulla
4. Prima di cliccare Deploy, vai su **Environment Variables** e aggiungi:
   ```
   Nome:  ANTHROPIC_API_KEY
   Valore: sk-ant-...la tua chiave...
   ```
5. Clicca **Deploy**

In 2 minuti ricevi un URL tipo `https://chefos-xxx.vercel.app` — il tuo gestionale è online.

---

## 💻 Sviluppo locale (opzionale)

```bash
cd chefos
npm install
```

Crea il file `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...la tua chiave...
```

Avvia:
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## 📁 Struttura progetto

```
chefos/
├── pages/
│   ├── _app.js          # App wrapper
│   ├── index.js         # Pagina principale
│   └── api/
│       └── analyze.js   # API route — tutte le chiamate Claude
├── components/
│   ├── ui.js            # Componenti UI riusabili
│   ├── StageFornitori.js
│   └── stages.js        # Menu, Presenze, Ordini, Magazzino, Report
├── lib/
│   ├── api.js           # Client fetch helper
│   └── demo.js          # Dati dimostrativi
├── styles/
│   └── globals.css
├── next.config.js
└── package.json
```

---

## 🔑 Sicurezza

La API key Anthropic non è mai esposta al browser.
Tutte le chiamate AI passano attraverso `/api/analyze` (server-side Next.js).

---

## 📋 Funzionalità

| Fase | Funzione |
|------|----------|
| **Fornitori** | Carica listini, confronto prezzi automatico, verifica qualità online (web search) |
| **Menu** | Menu settimanale + ricettario → distinta ingredienti per piatto |
| **Presenze** | Coperti previsti → analisi picchi e media |
| **Ordini** | Incrocio automatico → bozza ordini per fornitore con date consegna |
| **Magazzino** | DDT + scarichi → giacenze, anomalie, bozza inventario |
| **Report** | Food cost %, sprechi, KPI, semaforo per area |

---

## 🔮 Evoluzioni future

- Autenticazione utenti (NextAuth)
- Database persistente (Supabase / PlanetScale)
- Integrazione con gestionali esistenti via API
- Menu digitale con QR code per la linea
- App mobile (React Native / Expo)
