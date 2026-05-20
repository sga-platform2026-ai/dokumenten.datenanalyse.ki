---
# =============================================================================
# GROK – zentrale Konfiguration (maschinenlesbar, YAML-Frontmatter)
# API-Key NICHT hier eintragen → nur in .env.local als GROK_API_KEY
# =============================================================================

apiUrl: https://api.x.ai/v1/chat/completions
model: grok-4.3
reasoning_effort: high
temperature: 0
max_tokens: 8192
requestTimeoutMs: 180000
analysisCacheVersion: v9-grok-md-config

# Zweiter Aufruf (Antwortbrief), wenn die Analyse-Pipeline reaktiviert ist
letter_temperature: 0.3
letter_max_tokens: 4096
letter_reasoning_effort: high

# Retry bei zu wenigen erkannten Artikeln (Schwellwert)
retryArticleThreshold: 2
---

# Grok-Konfiguration (Dokumentenprüfung GA IV)

**Diese Datei ist die einzige Quelle für alle Grok-Einstellungen und -Anweisungen.**  
Pfad im Projekt: `config/Grok-Konfiguration.md`

Der Code liest den YAML-Block oben (`---` … `---`) automatisch über [`lib/grokConfig.ts`](../lib/grokConfig.ts).

---

## API-Key (nur außerhalb dieser Datei)

| Was | Wo |
|-----|-----|
| `GROK_API_KEY` | `.env.local` (lokal) bzw. Vercel Environment Variables |
| Key erzeugen | [console.x.ai](https://console.x.ai/) |

```powershell
copy .env.example .env.local
# In .env.local: GROK_API_KEY=xai-…
```

Nach Änderung an `.env.local`: Dev-Server neu starten (`npm run dev`).

---

## Aktuelle API-Parameter (xAI Chat Completions)

| Parameter | Wert | Bedeutung |
|-----------|------|-----------|
| `apiUrl` | `https://api.x.ai/v1/chat/completions` | xAI-Endpunkt |
| `model` | `grok-4.3` | Modell |
| `reasoning_effort` | `high` | Reasoning-Aufwand (`none`, `low`, `medium`, `high`) |
| `temperature` | `0` | Artikel-/Analyse-Call (deterministisch) |
| `max_tokens` | `8192` | Maximale Antwortlänge Artikel-Call |
| `requestTimeoutMs` | `180000` | Timeout pro Request (ms) |
| `letter_temperature` | `0.3` | Antwortbrief-Call |
| `letter_max_tokens` | `4096` | Antwortbrief-Call |
| `letter_reasoning_effort` | `high` | Antwortbrief-Call |

**Parameter ändern:** nur den YAML-Block oben bearbeiten, speichern, Server neu starten.

---

## Analyse-Pipeline (Status)

| Schritt | Status |
|---------|--------|
| Upload / PDF / DOCX / OCR | aktiv |
| Grok-Aufruf (`lib/grokChat.ts`) | vorbereitet, liest diese Datei |
| Dokumenten-Analyse (`lib/aiClient.ts`) | **deaktiviert** (`ANALYSIS_PROMPTS_CONFIGURED = false` → HTTP 503) |
| Wissensbasis / Systemprompts | entfernt (Neutralzustand) |

### Geplante zwei Aufrufe (nach Reaktivierung)

1. **Artikel-Call** – Absender, Artikelprüfung, JSON `<!--GA_IV_ARTICLES-->`  
   → `model`, `temperature`, `max_tokens`, `reasoning_effort` aus diesem Frontmatter  

2. **Brief-Call** – nur Antwortbrief  
   → `letter_temperature`, `letter_max_tokens`, `letter_reasoning_effort`

### Cache

- In-Memory, TTL 1 Stunde (`lib/analysisCache.ts`)
- Version: `analysisCacheVersion` im Frontmatter – bei Pipeline-Änderung erhöhen

---

## Key testen

```bash
npm run test:grok
```

Nutzt dieselbe Konfiguration wie die App (diese Datei + `GROK_API_KEY` aus `.env.local`).

---

## Vercel

Nur `GROK_API_KEY` in den Environment Variables setzen. Alle übrigen Grok-Werte kommen aus **dieser Datei** im Repository (nach Deploy).

---

## Technische Anbindung (nur Implementierung, keine zweite Config)

| Datei | Rolle |
|-------|--------|
| `config/Grok-Konfiguration.md` | **Sie pflegen hier** |
| `lib/grokConfig.ts` | Liest Frontmatter + `GROK_API_KEY` |
| `lib/grokChat.ts` | HTTP-Aufruf an xAI |
| `lib/aiClient.ts` | Orchestrierung (derzeit aus) |

Es gibt **keine** weiteren Grok-Default-Listen in README oder `.env.example`.
