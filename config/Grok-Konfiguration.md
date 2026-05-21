---
# =============================================================================
# GROK – zentrale Konfiguration (maschinenlesbar, YAML-Frontmatter)
# API-Key NICHT hier eintragen → nur in .env.local als GROK_API_KEY
# =============================================================================

promptVersion: 1.3
apiUrl: https://api.x.ai/v1/chat/completions
model: grok-4.3
reasoning_effort: high
temperature: 0.0
max_tokens: 2048
requestTimeoutMs: 180000
analysisCacheVersion: v1.3-systemprompt

retryArticleThreshold: 2
---

# Grok-Konfiguration (Dokumentenprüfung GA IV)

**Diese Datei ist die einzige Quelle für alle Grok-API-Einstellungen.**  
Pfad im Projekt: `config/Grok-Konfiguration.md`

Verhalten und Analysevorgaben: [`config/GA-IV-Systemprompt.md`](GA-IV-Systemprompt.md)  
Fachwissen: [`config/GA-IV-Wissensdatenbank.md`](GA-IV-Wissensdatenbank.md)

Der Code liest den YAML-Block oben (`---` … `---`) über [`lib/grokConfig.ts`](../lib/grokConfig.ts).

---

## API-Key (nur außerhalb dieser Datei)

| Was | Wo |
|-----|-----|
| `GROK_API_KEY` | `.env.local` (lokal) bzw. Vercel Environment Variables |
| Key erzeugen | [console.x.ai](https://console.x.ai/) |

Nach Änderung an `.env.local`: Dev-Server neu starten (`npm run dev`).

---

## Aktuelle API-Parameter

| Parameter | Wert | Bedeutung |
|-----------|------|-----------|
| `promptVersion` | `1.3` | Prompt-/Konfigurationsversion (Dokumentation) |
| `apiUrl` | `https://api.x.ai/v1/chat/completions` | xAI-Endpunkt |
| `model` | `grok-4.3` | Modell |
| `reasoning_effort` | `high` | Reasoning-Aufwand |
| `temperature` | `0.0` | Analyse-Call |
| `max_tokens` | `2048` | Maximale Antwortlänge |
| `requestTimeoutMs` | `180000` | Timeout (ms) |
| `retryArticleThreshold` | `2` | Retry wenn weniger Artikel erkannt |

---

## Analyse-Pipeline

| Schritt | Status |
|---------|--------|
| Upload / PDF / DOCX / OCR | aktiv |
| Grok | **Ein-Call** – nur Schreiben-Analyse, **kein Antwortbrief** |
| Systemprompt | `config/GA-IV-Systemprompt.md` |

### Cache

- In-Memory, TTL 1 Stunde (`lib/analysisCache.ts`)
- Version: `analysisCacheVersion` – bei Änderungen erhöhen

---

## Key testen

```bash
npm run test:grok
```
