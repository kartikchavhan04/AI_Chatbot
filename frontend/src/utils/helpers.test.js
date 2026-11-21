import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getConversationTitle } from "./helpers.js";
import { getApiErrorMessage } from "../services/chatService.js";

describe("conversation titles", () => {
  it("normalizes whitespace and keeps short prompts intact", () => {
    assert.equal(getConversationTitle("  Help   me write  "), "Help me write");
  });

  it("truncates long prompts to a readable title", () => {
    const title = getConversationTitle("a".repeat(80));
    assert.equal(title.length, 40);
    assert.ok(title.endsWith("…"));
  });
});

describe("API error messages", () => {
  it("uses the safe message returned by Flask", () => {
    assert.equal(
      getApiErrorMessage({ response: { data: { message: "Ollama is unavailable." } } }),
      "Ollama is unavailable.",
    );
  });

  it("explains a network failure without leaking internals", () => {
    assert.match(
      getApiErrorMessage({ request: {} }),
      /Could not reach the backend/,
    );
  });
});
