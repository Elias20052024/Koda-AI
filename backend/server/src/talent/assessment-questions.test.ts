import assert from "node:assert/strict";
import test from "node:test";
import { parseAssessmentQuestions } from "./assessment-questions.js";

const objectiveQuestion = {
  type: "single_choice",
  prompt: "Which JavaScript value represents an absent object property?",
  options: [
    { id: "a", label: "undefined" },
    { id: "b", label: "NaN" },
    { id: "c", label: "Infinity" },
  ],
  answerKey: "a",
  maxPoints: 1,
  explanation: "Reading an absent object property returns undefined.",
};

test("question-bank content validates objective questions and answer keys", () => {
  const result = parseAssessmentQuestions(JSON.stringify({ questions: [objectiveQuestion] }), 1);
  assert.equal(result[0].answerKey, "a");
  assert.equal(result[0].options?.length, 3);
});

test("question-bank content validates rubric-based subjective questions", () => {
  const result = parseAssessmentQuestions(JSON.stringify({
    questions: [{
      type: "short_answer",
      prompt: "Describe how you would debug a failed deployment.",
      maxPoints: 5,
      rubric: [
        { criterion: "Identifies a diagnostic step", maxPoints: 2 },
        { criterion: "Explains a safe resolution", maxPoints: 3 },
      ],
    }],
  }), 1);
  assert.equal(result[0].type, "short_answer");
  assert.equal(result[0].rubric?.length, 2);
  assert.deepEqual(result[0].answerKey, {});
});

test("question-bank content rejects malformed counts, answer keys, and rubric totals", () => {
  assert.throws(() => parseAssessmentQuestions("not-json", 1), /valid JSON/);
  assert.throws(() => parseAssessmentQuestions(JSON.stringify({ questions: [objectiveQuestion] }), 2), /number of questions/);
  assert.throws(() => parseAssessmentQuestions(JSON.stringify({
    questions: [{ ...objectiveQuestion, answerKey: "outside-options" }],
  }), 1), /answer key/);
  assert.throws(() => parseAssessmentQuestions(JSON.stringify({
    questions: [{
      type: "short_answer",
      prompt: "Explain the result.",
      maxPoints: 5,
      rubric: [{ criterion: "Reasoning", maxPoints: 4 }],
    }],
  }), 1), /add up/);
});
