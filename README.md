# Dokumentenprüfung GA IV

Moderne Web-App zur Prüfung amtlicher Schreiben nach dem IV. Genfer Abkommen (GA IV). Nutzer laden Dokumente hoch; die App extrahiert Text, prüft die Lesbarkeit und erstellt per KI eine strukturierte Analyse sowie einen Antwortbrief-Entwurf.

## Tech-Stack

- Next.js (App Router)
- TypeScript (strict)
- React
- Tailwind CSS
- Vercel-ready Deployment

## Installation

```bash
npm install
```

## Lokale Entwicklung

1. Umgebungsdatei anlegen (siehe Abschnitt **Umgebungsdateien – Benennung**)
2. Optional `GROK_API_KEY` in `.env.local` eintragen; Grok-Parameter in [`config/Grok-Konfiguration.md`](config/Grok-Konfiguration.md)
3. Dev-Server starten:

```bash
npm run dev
```

App: [http://localhost:3010](http://localhost:3010)

## Umgebungsdateien – Benennung

Next.js lädt Variablen automatisch aus Dateien im Projektroot. Für dieses Projekt gilt:

| Datei | Zweck | Im Git? |
|-------|--------|---------|
| **`.env.example`** | Vorlage mit allen Variablennamen (ohne echte Keys) | Ja |
| **`.env.local`** | Ihre lokale Konfiguration mit API-Key | Nein (gitignored) |

**Nicht** `.env` im Repository ablegen – lokale Secrets gehören in **`.env.local`**.

Anlegen unter Windows (PowerShell im Projektordner):

```powershell
copy .env.example .env.local
```

Unter macOS/Linux:

```bash
cp .env.example .env.local
```

Die Datei **`.env.local`** ist bereits im Projekt vorhanden; tragen Sie dort Ihren Key ein. Nach Änderungen den Dev-Server neu starten.

## Environment Variables

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `GROK_API_KEY` | Nein (ja für Live-KI) | Nur der API-Key – in `.env.local` / Vercel. Alle übrigen Grok-Werte: [`config/Grok-Konfiguration.md`](config/Grok-Konfiguration.md) |
| `AUTH_USERNAME` | Nein (ja für Login) | Benutzername für den Zugangsschutz |
| `AUTH_PASSWORD` | Nein (ja für Login) | Passwort für den Zugangsschutz |
| `AUTH_SECRET` | Nein (ja für Login) | Geheimer Schlüssel für signierte Session-Cookies (mind. 32 Zeichen) |

**Vercel:** nur `GROK_API_KEY` setzen; Modell und Parameter kommen aus [`config/Grok-Konfiguration.md`](config/Grok-Konfiguration.md).

## Zugangsschutz (optional)

Die App kann mit einem einfachen Benutzername/Passwort-Login geschützt werden. Dafür müssen **alle drei** Variablen `AUTH_USERNAME`, `AUTH_PASSWORD` und `AUTH_SECRET` gesetzt sein (`AUTH_SECRET` mindestens 32 Zeichen).

- **Nicht alle gesetzt:** Die App läuft ohne Login (wie bisher).
- **Alle gesetzt:** Middleware schützt alle Routen außer `/login`, `/api/auth/*` und statischen Assets. Die Anmeldung erfolgt über `/login`; die Session wird als httpOnly-Cookie (HMAC SHA-256) gespeichert.

`AUTH_SECRET` lokal erzeugen:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Abmelden über den Button **Abmelden** in der Kopfzeile (nur sichtbar, wenn Auth aktiv ist).

API-Key prüfen (lokal, nutzt `.env.local`):

```bash
npm run test:grok
```

## Unterstützte Dateiformate

- **PDF** – Textextraktion via pdf.js
- **DOCX** – Textextraktion via mammoth
- **JPG, PNG, TIFF** – Texterkennung via Tesseract.js (Sprache: Deutsch)

Schlecht lesbare Scans liefern die Meldung: *„Dokument nicht ausreichend lesbar – bitte bessere Datei hochladen“*.

## Grok-Konfiguration

**Zentrale Datei:** [`config/Grok-Konfiguration.md`](config/Grok-Konfiguration.md) – Modell, `reasoning_effort`, Temperature, Tokens, Timeouts, Pipeline-Hinweise. Nur der API-Key liegt in `.env.local`.

Key testen: `npm run test:grok`

## Wissensdatenbank (GA IV)

**Lesen:** [`config/GA-IV-Wissensdatenbank.md`](config/GA-IV-Wissensdatenbank.md) – 15 Artikel mit Bedeutung, Prüfregeln und Stichwörtern.

**Technische Quelle:** `lib/knowledge/ga-iv-articles.ts` – nach Änderungen: `npm run gen:knowledge-md`

## KI-Analyse / Prompts

Die Dokumenten-Auswertung (Grok) ist derzeit **deaktiviert**: Es fehlen Prüfauftrag und Auswertungs-Prompts. Die **Wissensdatenbank** (15 Artikel) ist wieder vorhanden. Bis zur Reaktivierung liefert `POST /api/analyze` den Status **503** mit der Meldung *„KI-Analyse ist nicht konfiguriert …“*.

Reaktivierung: Prüfauftrag und Prompts neu anlegen, `ANALYSIS_PROMPTS_CONFIGURED` in `lib/analysisConfig.ts` auf `true` setzen und `lib/aiClient.ts` wieder anbinden.

Tests (Parser-Infrastruktur): `npm run test:articles`

## API

`POST /api/analyze`

Request:

```json
{
  "documentText": "…",
  "fileName": "beispiel.pdf"
}
```

Response:

```json
{
  "analysis": "…",
  "letter": "…",
  "metadata": {
    "model": "grok-4.3",
    "provider": "grok",
    "timestamp": "…"
  }
}
```

## GitHub Repository

**Ziel-Repository:** [sga-platform2026-ai/dokumenten.datenanalyse.ki](https://github.com/sga-platform2026-ai/dokumenten.datenanalyse.ki)

Remote (lokal):

```text
origin → https://github.com/sga-platform2026-ai/dokumenten.datenanalyse.ki.git
```

### Ersten Push ausführen

Mit einem GitHub-Konto, das **Schreibrecht** auf die Organisation `sga-platform2026-ai` hat:

```powershell
.\scripts\push-to-sga.ps1
```

Oder manuell: `gh auth login` (Browser) → `git push -u origin main`

**Hinweis:** `.env.local` wird nicht committed (API-Keys bleiben lokal).

## Vercel Deployment

1. Repository **sga-platform2026-ai/dokumenten.datenanalyse.ki** mit Vercel verbinden
2. Framework Preset: **Next.js**
3. Environment Variables in Vercel: `GROK_API_KEY`; Grok-Parameter in `config/Grok-Konfiguration.md`
4. Deploy – Build Command: `npm run build`

## Projektstruktur

```
app/
  page.tsx              # Tool-Oberfläche
  api/analyze/route.ts  # KI-Analyse (serverseitig)
components/             # UI-Komponenten
lib/
  auth/                 # Session, Credentials, Middleware-Hilfen
  knowledge/            # GA-IV-Wissensdatenbank (15 Artikel)
  analysisConfig.ts     # Schalter: Prompts konfiguriert ja/nein
  aiClient.ts           # KI-Analyse (derzeit deaktiviert)
middleware.ts           # Route-Schutz bei aktivem Auth
hooks/                  # Upload-Workflow
types/                  # TypeScript-Typen
```

## Hinweis

Die Anwendung erstellt automatisierte Textentwürfe. Die Ausgabe ersetzt keine individuelle Prüfung und stellt keine Rechtsberatung dar.
