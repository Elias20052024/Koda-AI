export const DEFAULT_MATCH_WEIGHTS = {
  assessment: 0.45,
  skills: 0.3,
  projectsExperience: 0.15,
  education: 0.1,
} as const;

export type MatchWeightKey = keyof typeof DEFAULT_MATCH_WEIGHTS;
export type MatchWeights = Record<MatchWeightKey, number>;

export const MATCH_WEIGHTS: MatchWeights = { ...DEFAULT_MATCH_WEIGHTS };

export type MatchComponents = {
  assessment: number | null;
  skills: number | null;
  projectsExperience: number | null;
  education: number | null;
  evidenceCoverage?: Partial<Record<keyof typeof MATCH_WEIGHTS, number>>;
};

export type MatchBreakdown = {
  score: number | null;
  coverage: number;
  weights: MatchWeights;
  components: {
    [K in MatchWeightKey]: {
      weight: number;
      score: number | null;
      evidenceCoverage: number;
      normalizedContribution: number;
    };
  };
};

export function calculateMatchScore(
  components: MatchComponents,
  weights: MatchWeights = MATCH_WEIGHTS,
): MatchBreakdown {
  const totalWeight = Object.values(weights).reduce((total, weight) => {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError("Match weights must be finite and nonnegative.");
    }
    return total + weight;
  }, 0);
  if (totalWeight === 0) throw new RangeError("At least one match weight must be positive.");
  const normalizedWeights = Object.fromEntries(
    Object.entries(weights).map(([key, weight]) => [key, weight / totalWeight]),
  ) as MatchWeights;

  let availableWeight = 0;
  let weightedScore = 0;

  for (const key of Object.keys(normalizedWeights) as MatchWeightKey[]) {
    const score = components[key];
    if (score === null) continue;
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new RangeError(`${key} match score must be between 0 and 100.`);
    }
    const evidenceCoverage = components.evidenceCoverage?.[key] ?? 100;
    if (!Number.isFinite(evidenceCoverage) || evidenceCoverage < 0 || evidenceCoverage > 100) {
      throw new RangeError(`${key} evidence coverage must be between 0 and 100.`);
    }
    const effectiveWeight = normalizedWeights[key] * evidenceCoverage / 100;
    availableWeight += effectiveWeight;
    weightedScore += score * effectiveWeight;
  }

  const componentBreakdown = (key: MatchWeightKey) => {
    const score = components[key];
    const evidenceCoverage = score === null ? 0 : components.evidenceCoverage?.[key] ?? 100;
    const effectiveWeight = normalizedWeights[key] * evidenceCoverage / 100;
    return {
      weight: normalizedWeights[key],
      score,
      evidenceCoverage,
      normalizedContribution: score === null || availableWeight === 0
        ? 0
        : score * effectiveWeight / availableWeight,
    };
  };

  return {
    score: availableWeight === 0 ? null : weightedScore / availableWeight,
    coverage: availableWeight * 100,
    weights: normalizedWeights,
    components: {
      assessment: componentBreakdown("assessment"),
      skills: componentBreakdown("skills"),
      projectsExperience: componentBreakdown("projectsExperience"),
      education: componentBreakdown("education"),
    },
  };
}

function normalizeEvidence(value: string) {
  return value.trim().toLocaleLowerCase();
}

function calculateCoverage(required: string[], evidence: string[]) {
  const expected = [...new Set(required.map(normalizeEvidence).filter(Boolean))];
  if (expected.length === 0) return null;

  const available = new Set(evidence.map(normalizeEvidence).filter(Boolean));
  if (available.size === 0) return null;
  return expected.filter((item) => available.has(item)).length / expected.length * 100;
}

function calculateWeightedCoverage(
  required: string[],
  evidence: string[],
  weights: Record<string, number>,
) {
  const expected = [...new Set(required.map(normalizeEvidence).filter(Boolean))];
  if (expected.length === 0) return null;

  let totalWeight = 0;
  let matchedWeight = 0;
  const available = new Set(evidence.map(normalizeEvidence).filter(Boolean));
  if (available.size === 0) return null;
  for (const skill of expected) {
    const weight = weights[skill] ?? 1;
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`Skill weight for ${skill} must be finite and nonnegative.`);
    }
    totalWeight += weight;
    if (available.has(skill)) matchedWeight += weight;
  }
  return totalWeight === 0 ? null : matchedWeight / totalWeight * 100;
}

export function calculateInternshipEvidenceMatch(input: {
  requiredSkills: string[];
  studentSkills: string[];
  assessmentScores: Record<string, number>;
  projectSkills: string[];
  experienceSkills: string[];
  requiredCoursework: string[];
  coursework: string[];
  requiredFieldsOfStudy: string[];
  fieldsOfStudy: string[];
  studentVerified?: boolean;
  eligibility?: {
    minimumMatchScore?: number | null;
    minimumAssessmentScore?: number | null;
    requireVerifiedStudent?: boolean;
  };
  skillWeights?: Record<string, number>;
  matchWeights?: MatchWeights;
}) {
  const requiredSkills = [...new Set(input.requiredSkills.map(normalizeEvidence).filter(Boolean))];
  const assessmentScores = new Map(
    Object.entries(input.assessmentScores).map(([skill, score]) => [normalizeEvidence(skill), score]),
  );
  const assessmentValues = requiredSkills
    .map((skill) => {
      const score = assessmentScores.get(skill);
      if (score === undefined) return null;
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new RangeError(`Assessment score for ${skill} must be between 0 and 100.`);
      }
      return { score, weight: input.skillWeights?.[skill] ?? 1 };
    })
    .filter((entry): entry is { score: number; weight: number } => entry !== null);
  if (assessmentValues.some(({ weight }) => !Number.isFinite(weight) || weight < 0)) {
    throw new RangeError("Assessment skill weights must be finite and nonnegative.");
  }
  const assessmentWeight = assessmentValues.reduce((sum, entry) => sum + entry.weight, 0);
  const requiredSkillWeight = requiredSkills.reduce((sum, skill) => {
    const weight = input.skillWeights?.[skill] ?? 1;
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`Skill weight for ${skill} must be finite and nonnegative.`);
    }
    return sum + weight;
  }, 0);
  const assessment = assessmentWeight > 0
    ? assessmentValues.reduce((sum, entry) => sum + entry.score * entry.weight, 0) / assessmentWeight
    : null;
  const projectExperienceEvidence = [...input.projectSkills, ...input.experienceSkills];
  const educationRequirements = [...input.requiredCoursework, ...input.requiredFieldsOfStudy];
  const educationEvidence = [...input.coursework, ...input.fieldsOfStudy];

  const breakdown = calculateMatchScore({
    assessment,
    skills: calculateWeightedCoverage(input.requiredSkills, input.studentSkills, input.skillWeights ?? {}),
    projectsExperience: calculateWeightedCoverage(input.requiredSkills, projectExperienceEvidence, input.skillWeights ?? {}),
    education: calculateCoverage(educationRequirements, educationEvidence),
    evidenceCoverage: {
      assessment: requiredSkills.length
        ? requiredSkillWeight === 0 ? 0 : assessmentWeight / requiredSkillWeight * 100
        : 0,
    },
  }, input.matchWeights ?? MATCH_WEIGHTS);
  const eligibilityReasons: string[] = [];
  if (input.eligibility?.requireVerifiedStudent && !input.studentVerified) {
    eligibilityReasons.push("A verified student profile is required.");
  }
  const minimumAssessmentScore = input.eligibility?.minimumAssessmentScore;
  if (minimumAssessmentScore !== null && minimumAssessmentScore !== undefined) {
    if (assessment === null || assessment < minimumAssessmentScore) {
      eligibilityReasons.push(`Assessment score must be at least ${minimumAssessmentScore}%.`);
    }
  }
  const minimumMatchScore = input.eligibility?.minimumMatchScore;
  if (minimumMatchScore !== null && minimumMatchScore !== undefined) {
    if (breakdown.score === null || breakdown.score < minimumMatchScore) {
      eligibilityReasons.push(`Match score must be at least ${minimumMatchScore}%.`);
    }
  }
  return {
    ...breakdown,
    eligible: eligibilityReasons.length === 0,
    eligibilityReasons,
  };
}

export function explainMatch(breakdown: MatchBreakdown) {
  if (breakdown.score === null) {
    return "A match score is unavailable until profile or assessment evidence is added.";
  }

  const present = Object.entries(breakdown.components)
    .filter(([, component]) => component.score !== null)
    .map(([name, component]) => `${name}: ${Math.round(component.score ?? 0)}%`)
    .join(", ");
  const missing = Object.entries(breakdown.components)
    .filter(([, component]) => component.score === null)
    .map(([name]) => name)
    .join(", ");
  const incomplete = Object.entries(breakdown.components)
    .filter(([, component]) => component.score !== null && component.evidenceCoverage < 100)
    .map(([name]) => name)
    .join(", ");
  const coverageText = `Evidence coverage: ${Math.round(breakdown.coverage)}%.`;
  const weightsText = Object.entries(breakdown.weights)
    .map(([name, weight]) => `${name} ${Math.round(weight * 100)}%`)
    .join(", ");
  return [
    `Match score: ${Math.round(breakdown.score)}% using weights: ${weightsText}.`,
    present ? `Evidence scores: ${present}.` : "",
    missing ? `No evidence available yet for: ${missing}.` : "",
    incomplete ? `Evidence is incomplete for: ${incomplete}.` : "",
    coverageText,
  ].filter(Boolean).join(" ");
}
