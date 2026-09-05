# CONTEXT — Speed Duration for YouTube

Eine Browser-Extension, die neben YouTubes Zeitangabe im Player eine zweite, an die
Wiedergabegeschwindigkeit angepasste Zeit einblendet.

## Glossar

**Speed** — `video.playbackRate`. Kann von anderen Extensions (Enhancer for YouTube) auf
Werte außerhalb von YouTubes eigener 0.25–2-Auswahl gesetzt werden.

**Rohdauer** — `video.duration`. Die Dauer bei 1x, ohne jede Korrektur.

**SB-Dauer** — die von SponsorBlock berechnete Dauer *ohne* Sponsorsegmente. Wird aus dem
Text des Spans `#sponsorBlockDurationAfterSkips` gelesen. `null`, wenn SponsorBlock nicht
installiert oder für dieses Video nichts zu überspringen ist.

**Basisdauer** — SB-Dauer, falls vorhanden, sonst Rohdauer. Die Zahl, durch die Speed
geteilt wird.

**Modus** — welche der drei Zeiten angezeigt wird. Genau drei Werte:
- `total` — Basisdauer bei aktueller Speed. *Wie lange dauert das Video?*
- `remaining` — verbleibende reale Zeit. *Wie lange muss ich noch sitzen?*
- `endsAt` — Uhrzeit, zu der das Video zu Ende ist, minutengenau.

**Speed-Marker** — das `@1.5x`-Suffix in der eigenen Anzeige. Macht unterscheidbar, welche
Klammer von dieser Extension stammt und welche von SponsorBlock.

**Unschärfe-Marker** — das führende `~` im Modus `remaining`, wenn eine SB-Dauer vorliegt.
SponsorBlocks Span nennt nur die Summe *aller* Skips, nicht die noch bevorstehenden — die
Restzeit ist deshalb bewusst ohne Skip-Abzug gerechnet und als ungenau gekennzeichnet.

**Zeitcontainer** — `.ytp-time-contents` im YouTube-Player. Der DOM-Knoten, an den sowohl
SponsorBlock als auch diese Extension ihren Span anhängen.

**Eigener Span** — `#ysd-duration`. Der einzige Knoten, den diese Extension erzeugt oder
beschreibt. Er ist immer letztes Kind des Zeitcontainers.

## Nicht im Vokabular

Kein „Sponsorsegment", „Skip" oder „Kategorie" — diese Extension kennt SponsorBlocks
Domäne nicht, sie liest genau eine Zahl aus dessen Anzeige.
