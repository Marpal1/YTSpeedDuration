// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { buildBundle } from "../build.js";

describe("Eingechecktes Bundle", () => {
  it("passt zu den Quellen unter src/", async () => {
    const [committed, fresh] = await Promise.all([
      readFile("dist/content.js", "utf8"),
      buildBundle(),
    ]);
    // Schlaegt fehl, wenn src/ geaendert wurde ohne `npm run build`.
    expect(committed).toBe(fresh);
  });
});
