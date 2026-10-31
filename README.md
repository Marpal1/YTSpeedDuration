# Speed Duration for YouTube

**Deutsch** · [English](README.en.md)

Browser-Erweiterung, die im YouTube-Player zeigt, wie lange ein Video bei der eingestellten
Wiedergabegeschwindigkeit wirklich dauert. Ist [SponsorBlock](https://sponsor.ajay.app/)
installiert, wird dessen Dauer ohne Sponsorsegmente als Grundlage genommen.

```
1.5x, SponsorBlock aktiv:   12:34 / 45:00 (43:12) (28:48 @1.5x)
1.5x, ohne SponsorBlock:    12:34 / 45:00 (30:00 @1.5x)
1.0x, SponsorBlock aktiv:   12:34 / 45:00 (43:12)
```

`(43:12)` stammt von SponsorBlock, `(28:48 @1.5x)` von dieser Erweiterung.

## Funktionen

- Gesamtdauer, Restzeit oder Uhrzeit am Videoende, per Klick auf die Zahl umschaltbar
- Berücksichtigt jede Geschwindigkeit, auch von anderen Erweiterungen gesetzte
- SponsorBlock ist optional; ohne wird mit der vollen Videodauer gerechnet
- Keine Netzwerkanfragen, kein Tracking

## Installieren

Für Brave, Chrome, Edge und andere Chromium-Browser. Die Erweiterung ist nicht in einem
Store verfügbar und wird deshalb im Entwicklermodus geladen.

1. ZIP aus den [Releases](https://github.com/Marpal1/YTSpeedDuration/releases) herunterladen und
   entpacken, oder klonen:
   ```bash
   git clone https://github.com/Marpal1/YTSpeedDuration.git
   ```
2. Erweiterungsseite öffnen: `chrome://extensions`, `brave://extensions` oder `edge://extensions`
3. **Entwicklermodus** einschalten
4. **Entpackte Erweiterung laden** und den Projektordner wählen
5. YouTube-Tab neu laden

Node.js ist dafür nicht nötig, das fertige Content-Script `dist/content.js` liegt im Repository.
Den Ordner danach nicht verschieben oder löschen, der Browser lädt die Erweiterung von dort.

**Aktualisieren:** neue Version holen (`git pull` oder neu entpacken), auf der
Erweiterungsseite **Neu laden** klicken, YouTube-Tab neu laden.

## Bedienen

- **Klick auf die Zahl** wechselt den Modus:
  Gesamtdauer → Restzeit → Endzeit
- Das **Symbol in der Toolbar** öffnet den Standard-Modus und die Option
  „Bei 1x-Geschwindigkeit ausblenden" (standardmäßig an, betrifft die Gesamtdauer)

| Modus | Anzeige | Bedeutung |
|---|---|---|
| Gesamtdauer | `(28:48 @1.5x)` | Wie lange das Video bei dieser Geschwindigkeit dauert, ohne Sponsorsegmente |
| Restzeit | `(~21:38 @1.5x)` | Wie lange es von der aktuellen Position noch läuft |
| Endzeit | `(fertig 21:47)` | Uhrzeit, zu der es zu Ende ist |

Die Oberfläche folgt der Browsersprache: Deutsch, sonst Englisch.

Sponsorsegmente werden nur bei der **Gesamtdauer** abgezogen. SponsorBlocks Zahl nennt die
Summe *aller* Segmente, nicht die noch bevorstehenden. Restzeit und Endzeit sind deshalb
ohne Abzug gerechnet; das `~` kennzeichnet die Restzeit dann als ungenau. Siehe
[ADR 0001](docs/adr/0001-sponsorblock-kopplung-ueber-dom-span.md).

## Datenschutz

Die Erweiterung sendet keine Daten und stellt keine Netzwerkanfragen. Sie liest die Zeitanzeige
und das `<video>`-Element auf `www.youtube.com` und speichert nur ihre zwei Einstellungen in
`chrome.storage.sync`. Falls im Browser die Synchronisierung aktiv ist, gleicht dieser sie
zwischen deinen Geräten ab.

| Berechtigung | Wofür |
|---|---|
| `storage` | Einstellungen speichern |
| `https://www.youtube.com/*` | Anzeige im YouTube-Player |

## Zusammenspiel mit anderen Erweiterungen

- Erzeugt und beschreibt genau einen Knoten: `#ysd-duration`.
- Fremde Knoten werden nur **gelesen**, nie verändert. Kein Eingriff in YouTubes eigene Anzeige.
- Geschwindigkeitsänderungen kommen über `ratechange` am `<video>`, egal wer sie auslöst
  (YouTube, Enhancer for YouTube, Tastenkürzel).

## Wenn nichts erscheint

- Bei 1x blendet die Standardeinstellung die Gesamtdauer aus. Geschwindigkeit ändern oder die
  Option im Popup abschalten.
- Während Werbung und bei Live-Streams zeigt die Erweiterung bewusst nichts an.
- Sonst: Inhalt von `tools/check-selectors.js` in die DevTools-Konsole des YouTube-Tabs einfügen.
  Es zeigt getrennt, ob das Content-Script gestartet ist und ob es den Zeitcontainer findet.

YouTube baut seine Oberfläche gelegentlich um, dann kann die Anzeige bis zu einem Update ausfallen.
Beim Melden eines Problems bitte Browser, Erweiterungs-Version und die Ausgabe des Skripts angeben.

## Bekannte Grenzen

- Restzeit und Endzeit ziehen Sponsorsegmente nicht ab.
- Keine Playlist-Gesamtrestzeit.
- Nur Desktop-YouTube auf `www.youtube.com`: keine Shorts, kein YouTube Music, kein
  `m.youtube.com`, keine Embeds über `youtube-nocookie.com`.
- Die Kopplung an SponsorBlock läuft über dessen Anzeige (`#sponsorBlockDurationAfterSkips`), es
  gibt keine offizielle Schnittstelle. Ändert sich diese, wird ohne Abzug gerechnet; die Anzeige
  bricht nicht. Ist dort SponsorBlocks Option für die Zeit ohne Skips aus, gibt es nichts zu lesen.

## Entwickeln

Voraussetzung: Node.js.

```bash
npm install
npm run build      # dist/content.js neu bauen
npm test           # baut und führt alle Tests aus
npm run test:watch
```

`dist/content.js` ist eingecheckt und muss nach jeder Änderung in `src/` neu gebaut werden; ein
Test schlägt sonst fehl (siehe [ADR 0002](docs/adr/0002-kein-build-schritt.md)).

| Pfad | Inhalt |
|---|---|
| `src/core/` | reine Logik: kein DOM, keine Uhr, kein `chrome.*` |
| `src/content/` | die einzige Stelle, die YouTubes und SponsorBlocks DOM kennt |
| `src/popup/` | Toolbar-Popup |
| `_locales/` | Oberflächentexte auf Deutsch und Englisch |
| `src/settings.js` | `chrome.storage.sync` hinter synchroner Schnittstelle |
| `build.js` | esbuild-Bundle nach `dist/content.js` |
| `tools/` | Konsolen-Snippets zur Fehlersuche am echten Player |
| `docs/adr/` | Architekturentscheidungen |
| `CONTEXT.md` | Begriffe des Projekts |

## Lizenz und Hinweis

[MIT](LICENSE).

Unabhängiges Projekt, nicht mit YouTube, Google oder SponsorBlock verbunden.
