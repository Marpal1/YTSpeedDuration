import { describe, it, expect } from "vitest";
import { createMessages } from "../../src/core/messages.js";

describe("createMessages", () => {
  it("holt jeden Text ueber seinen Uebersetzungsschluessel", () => {
    const translations = {
      endsAtPrefix: "done",
      modeTotal: "Total duration",
      modeRemaining: "Time remaining",
      modeEndsAt: "End time",
      hideAtNormalSpeed: "Hide at 1x",
      defaultModeLegend: "Default mode",
      hint: "Click to switch.",
    };

    const messages = createMessages((key) => translations[key]);

    expect(messages).toEqual({
      endsAtPrefix: "done",
      modeLabels: {
        total: "Total duration",
        remaining: "Time remaining",
        endsAt: "End time",
      },
      hideAtNormalSpeed: "Hide at 1x",
      defaultModeLegend: "Default mode",
      hint: "Click to switch.",
    });
  });
});
