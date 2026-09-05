# ADR 0001 — Kopplung an SponsorBlock ueber dessen Anzeige-Span

Datum: 2026-09-05
Status: angenommen

## Kontext

SponsorBlock zeigt die Dauer ohne Sponsorsegmente in derselben Zeile des Players an.
Wer beide Extensions nutzt, will die geschwindigkeitsangepasste Zahl auf *dieser*
Basis, nicht auf der Rohdauer.

Es gibt keine offizielle Schnittstelle zwischen Extensions. Drei Wege standen zur Wahl:

1. SponsorBlocks Anzeige-Span `#sponsorBlockDurationAfterSkips` auslesen
2. SponsorBlocks Preview-Bar (`li.previewbar[sponsorblock-category]`, inline `left`/`width`
   in Prozent) parsen und die Segmente selbst aufsummieren
3. Die SponsorBlock-API selbst abfragen

## Entscheidung

Weg 1. Gelesen wird genau eine Zahl aus genau einem Knoten, ueber `parseSponsorDuration`.

Fehlt der Knoten oder ist er leer, faellt die Rechnung auf `video.duration` zurueck.

## Begruendung

- Weg 3 wuerde SponsorBlock im Kern nachbauen: Netzwerkzugriff, zusaetzliche
  Host-Permissions und eine eigene Privacy-Frage — fuer ein Feature, das nur
  Nutzern mit SponsorBlock etwas bringt.
- Weg 2 koppelt an zwei SponsorBlock-Interna statt an eines, und Prozentwerte in
  inline-Styles sind eine schlechte Datenquelle.
- Weg 1 hat eine klar begrenzte Bruchstelle: aendert SponsorBlock die Span-ID oder
  das Textformat, wird die Anzeige ungenauer, nicht kaputt.

## Folge

Im Modus `remaining` ist die SB-Dauer **nicht** verwendbar: sie nennt die Summe *aller*
Skips, nicht die noch bevorstehenden. Die Restzeit wird deshalb bewusst ohne Skip-Abzug
gerechnet und mit einem `~` als unscharf gekennzeichnet. Eine exakte Restzeit erforderte
Weg 2 — offen als eigenes Ticket.
