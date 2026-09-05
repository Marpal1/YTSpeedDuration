# ADR 0002 — Kein Build-Schritt

Datum: 2026-09-05
Status: angenommen

## Kontext

MV3-Content-Scripts kennen kein `"type": "module"`. Der uebliche Ausweg ist ein
Bundler, der die Module zu einem klassischen Script zusammenfasst.

## Entscheidung

Kein Bundler. Die in `manifest.json` eingetragene Datei `src/content/index.js` ist ein
klassisches Script, das die ES-Module per `import(chrome.runtime.getURL(...))` nachlaedt;
die Module stehen in `web_accessible_resources`.

## Begruendung

- Im Browser laeuft exakt derselbe Code, den auch Vitest importiert. Es gibt keinen
  Build-Schritt, der dazwischen etwas anderes erzeugen koennte.
- „Entpackte Erweiterung laden" zeigt auf den Projektordner. Kein `npm run build`,
  das man vor dem Neuladen vergessen kann.
- Der Preis ist ein zusaetzlicher asynchroner Ladeschritt beim Start. Die Anzeige
  erscheint ohnehin erst, wenn der Player steht.

## Folge

Neue Module unter `src/` muessen von den Mustern in `web_accessible_resources`
abgedeckt sein, sonst schlaegt der dynamische Import zur Laufzeit fehl.
