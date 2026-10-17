import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateQuestionPoints,
  isReadyQuestion,
  validateAssessmentAnswer,
} from "./assessment-scoring.js";

const reviewedAt = new Date("2025-01-01T00:00:00.000Z");
const choices = [
  { id: "a", label: "Choice A" },
  { id: "b", label: "Choice B" },
  { id: "c", label: "Choice C" },
];

test("reviewed single-choice questions accept only available choices and score deterministically", () => {
  const question = {
    type: "single_choice",
    options: choices,
    answerKey: "b",
    maxPoints: "2.50",
    reviewedAt,
    reviewedByUserId: 7,
  };
  assert.equal(isReadyQuestion(question), true);
  assert.equal(validateAssessmentAnswer(question, "b"), "b");
  assert.equal(validateAssessmentAnswer(question, "unknown"), null);
  assert.equal(calculateQuestionPoints(question, "b"), 2.5);
  assert.equal(calculateQuestionPoints(question, "a"), 0);
});

test("multi-select scoring is order-independent and rejects duplicate or unknown choices", () => {
  const question = {
    type: "multi_select",
    options: choices,
    answerKey: ["a", "c"],
    maxPoints: 1,
    reviewedAt,
    reviewedByUserId: 7,
  };
  assert.equal(calculateQuestionPoints(question, ["c", "a"]), 1);
  assert.equal(calculateQuestionPoints(question, ["a"]), 0);
  assert.equal(validateAssessmentAnswer(question, ["a", "a"]), null);
  assert.equal(validateAssessmentAnswer(question, ["missing"]), null);
});

test("unreviewed and unsupported free-text questions are not eligible for timed assessments", () => {
  const question = {
    type: "short_answer",
    options: null,
    answerKey: { rubric: "not publicly exposed" },
    maxPoints: 1,
    reviewedAt: null,
    reviewedByUserId: null,
  };
  assert.equal(isReadyQuestion(question), false);
  assert.throws(() => calculateQuestionPoints(question, "anything"), /invalid assessment answer/);
});
