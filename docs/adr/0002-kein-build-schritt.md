# ADR 0002 — Gebuendeltes, eingechecktes Content-Script

Datum: 2026-09-05
Status: angenommen (ersetzt die urspruengliche Fassung „Kein Build-Schritt")

## Kontext

MV3-Content-Scripts kennen kein `"type": "module"`.

Die erste Fassung dieses ADR loeste das ohne Bundler: `src/content/index.js` war ein
klassisches Script, das die ES-Module per `import(chrome.runtime.getURL(...))` nachlud.
Das ist der von der Chrome-Dokumentation gezeigte Weg — er funktioniert in Chromium 130+
aber nicht mehr: der dynamische Import wird von der CSP der Seite abgelehnt
("Refused to load"), siehe crxjs/chrome-extension-tools#918. Auf YouTube erschien
dadurch schlicht gar nichts, ohne sichtbaren Fehler ausserhalb der Konsole.

## Entscheidung

`src/content/index.js` ist ein normales ES-Modul mit statischen Imports und wird von
`build.js` (esbuild, IIFE) nach `dist/content.js` gebuendelt. Das Manifest laedt dieses
Bundle. `web_accessible_resources` entfaellt ersatzlos.

**Das Bundle ist eingecheckt.** „Entpackte Erweiterung laden" funktioniert dadurch weiter
ohne einen einzigen vorherigen Befehl — die Eigenschaft, wegen der die erste Fassung
gewaehlt wurde, bleibt erhalten.

`test/build.test.js` baut frisch und vergleicht mit `dist/content.js`. Wer `src/` aendert,
ohne `npm run build` zu laufen, bekommt einen roten Test statt einer stillen Abweichung
zwischen getestetem und ausgeliefertem Code. `npm test` baut ohnehin vorher.

## Begruendung

- Der dynamische Import ist auf den Zielseiten nachweislich unbrauchbar.
- Eingechecktes Build-Output ist normalerweise ein Geruch; hier kauft es die einfache
  Installation zurueck, und der Staleness-Test entschaerft die uebliche Gefahr.
- Das Popup bleibt unveraendert: Erweiterungsseiten laden ES-Module nativ, dort gibt es
  das Problem nicht.

## Folge

Nach jeder Aenderung unter `src/content/`, `src/core/` oder an `src/settings.js`:
`npm run build`, und `dist/content.js` mit committen.
