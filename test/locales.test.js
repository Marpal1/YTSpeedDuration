import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createMessages } from "../src/core/messages.js";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const locale = (name) => readJson(`_locales/${name}/messages.json`);

/** Alle Texte eines Objekts, auch verschachtelte. */
const leaves = (value) =>
  typeof value === "object" ? Object.values(value).flatMap(leaves) : [value];

describe.each(["de", "en"])("Sprache %s", (name) => {
  it("liefert jeden Text, den die Erweiterung braucht", () => {
    const translations = locale(name);
    const texts = leaves(createMessages((key) => translations[key]?.message));
    expect(texts.every((text) => typeof text === "string" && text !== "")).toBe(true);
  });
});

describe("Uebersetzungen", () => {
  it("haben in beiden Sprachen dieselben Schluessel", () => {
    expect(Object.keys(locale("de")).sort()).toEqual(Object.keys(locale("en")).sort());
  });

  it("nennen die Endzeit je Sprache mit dem richtigen Wort", () => {
    expect(locale("de").endsAtPrefix.message).toBe("fertig");
    expect(locale("en").endsAtPrefix.message).toBe("done");
  });
});

describe("Manifest", () => {
  it("nutzt Englisch als Rueckfall und nur vorhandene Schluessel", () => {
    const manifest = readJson("manifest.json");
    expect(manifest.default_locale).toBe("en");

    const keys = [...JSON.stringify(manifest).matchAll(/__MSG_(\w+)__/g)].map((m) => m[1]);
    expect(keys).toContain("extDescription");
    for (const key of keys) expect(locale("en")).toHaveProperty(key);
  });
});
