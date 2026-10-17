export const MATCH_WEIGHTS = {
  assessment: 0.45,
  skills: 0.3,
  projectsExperience: 0.15,
  education: 0.1,
} as const;

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
  components: {
    [K in keyof typeof MATCH_WEIGHTS]: {
      weight: number;
      score: number | null;
      evidenceCoverage: number;
      normalizedContribution: number;
    };
  };
};

export function calculateMatchScore(components: MatchComponents): MatchBreakdown {
  let availableWeight = 0;
  let weightedScore = 0;

  for (const key of Object.keys(MATCH_WEIGHTS) as (keyof typeof MATCH_WEIGHTS)[]) {
    const score = components[key];
    if (score === null) continue;
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new RangeError(`${key} match score must be between 0 and 100.`);
    }
    const evidenceCoverage = components.evidenceCoverage?.[key] ?? 100;
    if (!Number.isFinite(evidenceCoverage) || evidenceCoverage < 0 || evidenceCoverage > 100) {
      throw new RangeError(`${key} evidence coverage must be between 0 and 100.`);
    }
    const effectiveWeight = MATCH_WEIGHTS[key] * evidenceCoverage / 100;
    availableWeight += effectiveWeight;
    weightedScore += score * effectiveWeight;
  }

  const componentBreakdown = (key: keyof typeof MATCH_WEIGHTS) => {
    const score = components[key];
    const evidenceCoverage = score === null ? 0 : components.evidenceCoverage?.[key] ?? 100;
    const effectiveWeight = MATCH_WEIGHTS[key] * evidenceCoverage / 100;
    return {
      weight: MATCH_WEIGHTS[key],
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
      return score;
    })
    .filter((score): score is number => score !== null);
  const assessment = assessmentValues.length
    ? assessmentValues.reduce((sum, score) => sum + score, 0) / assessmentValues.length
    : null;
  const projectExperienceEvidence = [...input.projectSkills, ...input.experienceSkills];
  const educationRequirements = [...input.requiredCoursework, ...input.requiredFieldsOfStudy];
  const educationEvidence = [...input.coursework, ...input.fieldsOfStudy];

  return calculateMatchScore({
    assessment,
    skills: calculateCoverage(input.requiredSkills, input.studentSkills),
    projectsExperience: calculateCoverage(input.requiredSkills, projectExperienceEvidence),
    education: calculateCoverage(educationRequirements, educationEvidence),
    evidenceCoverage: {
      assessment: requiredSkills.length
        ? assessmentValues.length / requiredSkills.length * 100
        : 0,
    },
  });
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
  return [
    `Match score: ${Math.round(breakdown.score)}% using assessment 45%, skills 30%, projects/experience 15%, and education/coursework 10%.`,
    present ? `Evidence scores: ${present}.` : "",
    missing ? `No evidence available yet for: ${missing}.` : "",
    incomplete ? `Evidence is incomplete for: ${incomplete}.` : "",
    coverageText,
  ].filter(Boolean).join(" ");
}
