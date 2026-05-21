# GA-IV-Beschwerde-Vorlagen

Diese Datei enthaelt die deterministischen Vorlagen fuer das Modul SGA-0109 Dokumenten-Bot & Chat.

Die Analyse-Ausgabe aus `config/GA-IV-Systemprompt.md` wird in diese Vorlagen uebernommen. Die Vorlagen werden nicht frei durch Grok formuliert, sondern durch die Anwendung mit den extrahierten Analysefeldern befuellt. Der Code liest die Abschnitte `## Vorlage GA IV Beschwerde ...` ueber `lib/templates/loadComplaintTemplates.ts`.

## Platzhalter

| Platzhalter | Bedeutung |
|---|---|
| `{{ABSENDER_NAME}}` | Name des Absenders |
| `{{ABSENDER_STRASSE}}` | Strasse und Hausnummer des Absenders |
| `{{ABSENDER_PLZ_ORT}}` | PLZ und Ort des Absenders |
| `{{BEHOERDE_VOLLER_NAME_UND_ADRESSE}}` | Vollstaendiger Name und Adresse der Behoerde / Institution |
| `{{LEITER_VOLL}}` | Leiter der Behoerde / Institution mit Amtsbezeichnung |
| `{{AKTENZEICHEN}}` | Aktenzeichen / Geschaeftszahl |
| `{{VERLETZTE_ARTIKEL}}` | Liste verletzter GA-IV-Artikel mit Begruendungen |
| `{{DATUM}}` | Datum der Beschwerde |
| `{{ORT}}` | Ort der Signierung |

## Vorlage GA IV Beschwerde - linksbuendig - an Leiter der Behoerde

Diplomatische,
zivilrechtliche,
voelkerrechtlich zwingend
wirksame
Beschwerde, gemaess den Genfer Abkommen IV von 1949 (GA IV)

Absender
{{ABSENDER_NAME}}
{{ABSENDER_STRASSE}}
{{ABSENDER_PLZ_ORT}}
Geschuetzter Zivilist gemaess Genfer Abkommen IV von 1949

Uebermittlung
Post per Einschreiben (mit Rueckschein)

Adressat
{{BEHOERDE_VOLLER_NAME_UND_ADRESSE}}
{{LEITER_VOLL}}

Geschaeftszahl / Aktenzeichen
{{AKTENZEICHEN}}

Betreff: Wirksame Beschwerde gegen treuhaenderischen Verwaltungsakt / institutionelle Gewalt

Voelkerrechtliche Grundlage: Genfer Abkommen von 1949, insbesondere Artikel 1 und Artikel 7 Abs. 2

Wertgeschaetzte verantwortliche Stelle
Wertgeschaetzte(r) Zivilist(in)

Ein treuhaenderischer Verwaltungsakt sowie institutionelle Gewalt sind gemaess Genfer Abkommen 1949 gegen geschuetzte Zivilisten verboten.

Es wird festgestellt, die Behoerde uebt einen treuhaenderischen Verwaltungsakt sowie institutionelle Gewalt gegen den geschuetzten Zivilisten aus.

{{VERLETZTE_ARTIKEL}}

Gemaess den Genfer Abkommen von 1949 gilt: Sobald eine wirksame Beschwerde eingegangen ist, muessen alle Massnahmen mit sofortiger Wirkung ruhen bzw. vollstaendig ausgesetzt werden. Jede Fortsetzung stellt einen Verstoss gegen das humanitaere Voelkerrecht dar und wird dem Schiedsgericht gemaess den Genfer Abkommen von 1949 zur Untersuchung vorgelegt.

Die Massnahme ist daher unverzueglich auszusetzen. Die wirksame Beschwerde wird gleichzeitig an das Schiedsgericht gemaess den Genfer Abkommen von 1949 uebermittelt.

Voelkerrechtliche Signatur ohne Recht-Verlust
Signierung (ohne Rechteverlust)

{{ABSENDER_NAME}}

Datum: {{DATUM}}, Ort: {{ORT}}
