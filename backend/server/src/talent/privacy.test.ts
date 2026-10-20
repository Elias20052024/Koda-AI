import assert from "node:assert/strict";
import test from "node:test";
import { hasValidCompanyAssessmentConsent } from "./privacy.js";

const activeConsent = {
  applicationId: 17,
  studentId: 42,
  revokedAt: null,
};

test("company assessment consent must match both application and student", () => {
  assert.equal(hasValidCompanyAssessmentConsent([activeConsent], 17, 42), true);
  assert.equal(hasValidCompanyAssessmentConsent([activeConsent], 18, 42), false);
  assert.equal(hasValidCompanyAssessmentConsent([activeConsent], 17, 43), false);
});

test("revoked consent does not authorize assessment score disclosure", () => {
  assert.equal(
    hasValidCompanyAssessmentConsent(
      [{ ...activeConsent, revokedAt: new Date() }],
      17,
      42,
    ),
    false,
  );
});
