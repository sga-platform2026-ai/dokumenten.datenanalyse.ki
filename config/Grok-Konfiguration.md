---
# =============================================================================
# GROK - zentrale Konfiguration (maschinenlesbar, YAML-Frontmatter)
# API-Key NICHT hier eintragen -> nur in .env.local als GROK_API_KEY
# =============================================================================

promptVersion: 1.4
apiUrl: https://api.x.ai/v1/chat/completions
model: grok-4.3
reasoning_effort: high
temperature: 0.0
max_tokens: 2048
requestTimeoutMs: 180000
analysisCacheVersion: v1.4-complaint-templates

retryArticleThreshold: 2
---

# Grok-Konfiguration (Dokumentenpruefung GA IV)

**Diese Datei ist die einzige Quelle fuer alle Grok-API-Einstellungen.**  
Pfad im Projekt: `config/Grok-Konfiguration.md`

Verhalten und Analysevorgaben: [`config/GA-IV-Systemprompt.md`](GA-IV-Systemprompt.md)  
Fachwissen: [`config/GA-IV-Wissensdatenbank.md`](GA-IV-Wissensdatenbank.md)  
Beschwerdevorlagen: [`config/GA-IV-Beschwerde-Vorlagen.md`](GA-IV-Beschwerde-Vorlagen.md)

Der Code liest den YAML-Block oben (`---` ... `---`) ueber [`lib/grokConfig.ts`](../lib/grokConfig.ts).

---

## API-Key (nur ausserhalb dieser Datei)

| Was | Wo |
|-----|-----|
| `GROK_API_KEY` | `.env.local` (lokal) bzw. Vercel Environment Variables |
| Key erzeugen | [console.x.ai](https://console.x.ai/) |

Nach Aenderung an `.env.local`: Dev-Server neu starten (`npm run dev`).

---

## Aktuelle API-Parameter

| Parameter | Wert | Bedeutung |
|-----------|------|-----------|
| `promptVersion` | `1.4` | Prompt-/Konfigurationsversion |
| `apiUrl` | `https://api.x.ai/v1/chat/completions` | xAI-Endpunkt |
| `model` | `grok-4.3` | Modell |
| `reasoning_effort` | `high` | Reasoning-Aufwand |
| `temperature` | `0.0` | deterministischer Analyse-Call |
| `max_tokens` | `2048` | maximale Antwortlaenge |
| `requestTimeoutMs` | `180000` | Timeout in Millisekunden |
| `retryArticleThreshold` | `2` | Retry, wenn weniger Artikel erkannt |

---

## Analyse- und Vorlagen-Pipeline

| Schritt | Status |
|---------|--------|
| Upload / PDF / DOCX / OCR | aktiv |
| Grok | Ein-Call fuer strukturierte Schreiben-Analyse |
| Systemprompt | `config/GA-IV-Systemprompt.md` |
| Wissensbasis | `config/GA-IV-Wissensdatenbank.md` |
| Beschwerdevorlagen | lokal aus `config/GA-IV-Beschwerde-Vorlagen.md`, kein freier LLM-Brief |

### Cache

- In-Memory, TTL 1 Stunde (`lib/analysisCache.ts`)
- Version: `analysisCacheVersion` - bei Prompt-/Vorlagenaenderungen erhoehen

---

## Key testen

```bash
npm run test:grok
```
