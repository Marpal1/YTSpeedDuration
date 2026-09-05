# Speed Duration for YouTube

Zeigt neben YouTubes Zeitangabe im Player, wie lange das Video bei der eingestellten
Wiedergabegeschwindigkeit wirklich dauert — im Stil von SponsorBlocks Anzeige.

```
1.5x, SponsorBlock aktiv:   12:34 / 45:00 (43:12) (28:48 @1.5x)
1.5x, ohne SponsorBlock:    12:34 / 45:00 (30:00 @1.5x)
1.0x:                       12:34 / 45:00 (43:12)
```

## Installieren (Brave, Chrome, Edge)

1. `brave://extensions` oeffnen
2. **Entwicklermodus** oben rechts einschalten
3. **Entpackte Erweiterung laden** und diesen Projektordner waehlen
4. YouTube-Tab neu laden

Es gibt keinen Build-Schritt — der Ordner ist die Erweiterung.

## Bedienen

- **Klick auf die eigene Zahl** wechselt den Modus:
  Gesamtdauer -> verbleibende Zeit -> Uhrzeit am Videoende
- Das **Symbol in der Toolbar** oeffnet den Standard-Modus und die Option
  „Bei 1x-Geschwindigkeit ausblenden"

## Die drei Modi

| Modus | Anzeige | Bedeutung |
|---|---|---|
| Gesamtdauer | `(28:48 @1.5x)` | Wie lange das Video bei dieser Geschwindigkeit dauert |
| Restzeit | `(~21:38 @1.5x)` | Wie lange noch zu sitzen ist |
| Endzeit | `(fertig 21:47)` | Uhrzeit, zu der es zu Ende ist |

Das `~` erscheint nur, wenn SponsorBlock aktiv ist: dessen Zahl nennt die Summe *aller*
uebersprungenen Sekunden, nicht die noch bevorstehenden — die Restzeit ist deshalb ohne
Skip-Abzug gerechnet. Siehe [ADR 0001](docs/adr/0001-sponsorblock-kopplung-ueber-dom-span.md).

## Koexistenz mit anderen Erweiterungen

- Erzeugt und beschreibt genau einen Knoten: `#ysd-duration`.
- Fremde Knoten werden ausschliesslich **gelesen**, nie veraendert — SponsorBlocks Span
  bleibt unangetastet.
- Kein `innerHTML` am Zeitcontainer, kein Eingriff in YouTubes eigene Anzeige.
- Haengt SponsorBlock seinen Span nach uns an, ruecken wir wieder ans Ende, damit die
  Reihenfolge stabil bleibt.
- Geschwindigkeitsaenderungen werden ueber `ratechange` am `<video>` gelesen — egal, wer
  sie gesetzt hat (YouTube selbst, Enhancer for YouTube, Tastenkuerzel).

## Entwickeln

```bash
npm install
npm test           # 54 Tests
npm run test:watch
```

Aufbau:

| Pfad | Inhalt |
|---|---|
| `src/core/` | reine Logik — kein DOM, keine Uhr, kein `chrome.*` |
| `src/content/` | die einzige Stelle, die YouTubes und SponsorBlocks DOM kennt |
| `src/popup/` | Toolbar-Popup |
| `src/settings.js` | `chrome.storage.sync` hinter synchroner Schnittstelle |
| `tools/check-selectors.js` | Konsolen-Snippet zur Selektor-Gegenprobe |

Offene Punkte liegen unter `.scratch/speed-duration/issues/`.

## Bekannte Grenzen

- Restzeit zieht Sponsorsegmente nicht ab (deshalb das `~`).
- Keine Playlist-Gesamtrestzeit.
- Nur Desktop-YouTube: keine Shorts, kein YouTube Music, kein `m.youtube.com`.
- Nur `www.youtube.com` — Embeds ueber `youtube-nocookie.com` sind nicht abgedeckt.
  Dafuer `https://www.youtube-nocookie.com/*` in `host_permissions`, `matches` und
  `web_accessible_resources` ergaenzen.
- Aendert SponsorBlock seine Span-ID, wird die Anzeige ungenauer (Rohdauer statt
  SB-Dauer) — sie bricht nicht.
