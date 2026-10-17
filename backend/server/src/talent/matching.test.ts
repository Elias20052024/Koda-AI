import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateInternshipEvidenceMatch,
  calculateMatchScore,
  explainMatch,
} from "./matching.js";

test("matching uses the configured weights and normalizes only available evidence", () => {
  const result = calculateMatchScore({
    assessment: 80,
    skills: 50,
    projectsExperience: null,
    education: null,
  });

  assert.equal(result.score, 68);
  assert.equal(result.coverage, 75);
  assert.equal(result.components.assessment.normalizedContribution, 48);
  assert.equal(result.components.skills.normalizedContribution, 20);
  assert.match(explainMatch(result), /Evidence coverage: 75%/);
  assert.match(explainMatch(result), /No evidence available yet for: projectsExperience, education/);
});

test("matching leaves scores unavailable when there is no evidence", () => {
  const result = calculateInternshipEvidenceMatch({
    requiredSkills: ["Python"],
    studentSkills: [],
    assessmentScores: {},
    projectSkills: [],
    experienceSkills: [],
    requiredCoursework: ["Statistics"],
    coursework: [],
    requiredFieldsOfStudy: [],
    fieldsOfStudy: [],
  });

  assert.equal(result.score, null);
  assert.equal(result.coverage, 0);
});

test("evidence comparisons are case-insensitive and score ranges are validated", () => {
  const result = calculateInternshipEvidenceMatch({
    requiredSkills: ["JavaScript", "SQL"],
    studentSkills: ["javascript"],
    assessmentScores: { JAVASCRIPT: 80 },
    projectSkills: ["sql"],
    experienceSkills: [],
    requiredCoursework: ["Database Systems"],
    coursework: ["database systems"],
    requiredFieldsOfStudy: [],
    fieldsOfStudy: [],
  });

  assert.equal(result.components.assessment.score, 80);
  assert.equal(result.components.skills.score, 50);
  assert.equal(result.components.projectsExperience.score, 50);
  assert.equal(result.components.education.score, 100);
  assert.ok(Math.abs((result.score ?? 0) - 2020 / 31) < 1e-10);
  assert.equal(result.coverage, 77.5);
  assert.throws(() => calculateMatchScore({
    assessment: 101,
    skills: null,
    projectsExperience: null,
    education: null,
  }), RangeError);
});
