/*
 * Buendelt das Content-Script nach `dist/content.js`.
 *
 * Das Ergebnis ist eingecheckt, damit „Entpackte Erweiterung laden" ohne
 * vorherigen Befehl funktioniert. `test/build.test.js` schlaegt fehl, wenn das
 * eingecheckte Bundle nicht mehr zu den Quellen passt.
 */
import * as esbuild from "esbuild";

export const BUILD_OPTIONS = {
  entryPoints: ["src/content/index.js"],
  bundle: true,
  format: "iife",
  target: "chrome111",
  charset: "utf8",
  banner: { js: "/* Generiert aus src/ von build.js — nicht von Hand aendern. */" },
};

/** Baut das Bundle und gibt seinen Inhalt zurueck, ohne zu schreiben. */
export async function buildBundle() {
  const result = await esbuild.build({ ...BUILD_OPTIONS, write: false });
  return result.outputFiles[0].text;
}

if (import.meta.filename === process.argv[1]) {
  const { writeFile, mkdir } = await import("node:fs/promises");
  await mkdir("dist", { recursive: true });
  await writeFile("dist/content.js", await buildBundle(), "utf8");
  console.log("dist/content.js gebaut");
}
