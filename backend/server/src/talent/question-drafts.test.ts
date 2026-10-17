import assert from "node:assert/strict";
import test from "node:test";
import { parseQuestionDrafts } from "./question-drafts.js";

const validDraft = {
  questions: [{
    prompt: "Which JavaScript value represents an absent object property?",
    options: [
      { id: "a", label: "undefined" },
      { id: "b", label: "NaN" },
      { id: "c", label: "Infinity" },
    ],
    answerKey: "a",
    explanation: "Reading an absent object property returns undefined.",
  }],
};

test("question drafts validate and preserve a private answer key for later review", () => {
  const result = parseQuestionDrafts(JSON.stringify(validDraft), 1);
  assert.equal(result[0].answerKey, "a");
  assert.equal(result[0].options.length, 3);
});

test("question drafts reject malformed JSON, counts, and answer keys", () => {
  assert.throws(() => parseQuestionDrafts("not-json", 1), /valid JSON/);
  assert.throws(() => parseQuestionDrafts(JSON.stringify(validDraft), 2), /requested number/);
  const invalidDraft = {
    questions: [{
      ...validDraft.questions[0],
      answerKey: "outside-options",
    }],
  };
  assert.throws(() => parseQuestionDrafts(JSON.stringify(invalidDraft), 1), /answer key/);
});
