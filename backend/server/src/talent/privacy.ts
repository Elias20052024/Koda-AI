type CompanyAssessmentConsent = {
  applicationId: number;
  studentId: number;
  revokedAt: Date | null;
};

export function hasValidCompanyAssessmentConsent(
  consents: readonly CompanyAssessmentConsent[],
  applicationId: number,
  studentId: number,
) {
  return consents.some((consent) =>
    consent.applicationId === applicationId &&
    consent.studentId === studentId &&
    consent.revokedAt === null,
  );
}
