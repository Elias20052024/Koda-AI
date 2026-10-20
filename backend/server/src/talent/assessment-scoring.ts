export type ScorableQuestion = {
  type: string;
  options: unknown;
  answerKey: unknown;
  rubric?: unknown;
  maxPoints: string | number;
  reviewedAt: Date | null;
  reviewedByUserId: number | null;
};

export function isReadyQuestion(question: ScorableQuestion) {
  if (question.type === "short_answer") {
    if (
      !question.reviewedAt ||
      !question.reviewedByUserId ||
      !Array.isArray(question.rubric) ||
      question.rubric.length === 0
    ) {
      return false;
    }
    const rubric = question.rubric as unknown[];
    if (rubric.some((criterion) =>
      !criterion ||
      typeof criterion !== "object" ||
      typeof (criterion as Record<string, unknown>).criterion !== "string" ||
      !Number.isFinite(Number((criterion as Record<string, unknown>).maxPoints)) ||
      Number((criterion as Record<string, unknown>).maxPoints) <= 0,
    )) {
      return false;
    }
    const rubricPoints = rubric.reduce<number>(
      (total, criterion) => total + Number((criterion as { maxPoints: number }).maxPoints),
      0,
    );
    return Number.isFinite(Number(question.maxPoints)) &&
      Math.abs(rubricPoints - Number(question.maxPoints)) <= 0.001;
  }

  if (
    !question.reviewedAt ||
    !question.reviewedByUserId ||
    !["single_choice", "multi_select", "scenario", "code_reading"].includes(question.type) ||
    !Array.isArray(question.options) ||
    !Number.isFinite(Number(question.maxPoints)) ||
    Number(question.maxPoints) <= 0
  ) {
    return false;
  }

  const options = question.options as unknown[];
  if (
    options.length < 2 ||
    options.some((option) =>
      !option ||
      typeof option !== "object" ||
      typeof (option as Record<string, unknown>).id !== "string" ||
      typeof (option as Record<string, unknown>).label !== "string",
    )
  ) {
    return false;
  }
  const optionIds = new Set(options.map((option) => (option as { id: string }).id));
  if (optionIds.size !== options.length) return false;
  if (question.type === "multi_select") {
    return Array.isArray(question.answerKey) &&
      question.answerKey.length > 0 &&
      new Set(question.answerKey).size === question.answerKey.length &&
      question.answerKey.every((answer) => typeof answer === "string" && optionIds.has(answer));
  }
  return typeof question.answerKey === "string" && optionIds.has(question.answerKey);
}

export function validateAssessmentAnswer(question: ScorableQuestion, answer: unknown) {
  if (!isReadyQuestion(question)) return null;
  if (question.type === "short_answer") {
    if (typeof answer !== "string" || answer.length > 5000) return null;
    return answer.trim();
  }
  const options = question.options as { id: string; label: string }[];
  const optionIds = new Set(options.map((option) => option.id));
  if (question.type === "multi_select") {
    if (
      !Array.isArray(answer) ||
      answer.length > options.length ||
      answer.some((value) => typeof value !== "string" || !optionIds.has(value)) ||
      new Set(answer).size !== answer.length
    ) {
      return null;
    }
    return answer;
  }
  if (typeof answer !== "string" || !optionIds.has(answer)) return null;
  return answer;
}

export function calculateQuestionPoints(question: ScorableQuestion, answer: unknown) {
  const validatedAnswer = validateAssessmentAnswer(question, answer);
  if (validatedAnswer === null) {
    throw new Error("Cannot score an invalid assessment answer.");
  }
  if (question.type === "short_answer") {
    throw new Error("Subjective answers must be scored by a human reviewer.");
  }

  let correct = validatedAnswer === question.answerKey;
  if (question.type === "multi_select") {
    const expected = (question.answerKey as string[]).slice().sort();
    correct = Array.isArray(validatedAnswer) &&
      validatedAnswer.length === expected.length &&
      validatedAnswer.slice().sort().every((value, index) => value === expected[index]);
  }
  return correct ? Number(question.maxPoints) : 0;
}

export function validateRubricGrade(
  question: ScorableQuestion,
  grades: unknown,
): number | null {
  if (!isReadyQuestion(question) || question.type !== "short_answer" || !Array.isArray(grades)) {
    return null;
  }
  const rubric = question.rubric as { criterion: string; maxPoints: number }[];
  if (grades.length !== rubric.length) return null;
  const gradesByCriterion = new Map<string, number>();
  for (const value of grades) {
    if (!value || typeof value !== "object") return null;
    const grade = value as Record<string, unknown>;
    if (typeof grade.criterion !== "string" || typeof grade.points !== "number") return null;
    if (gradesByCriterion.has(grade.criterion)) return null;
    gradesByCriterion.set(grade.criterion, grade.points);
  }
  let earned = 0;
  for (const criterion of rubric) {
    const points = gradesByCriterion.get(criterion.criterion);
    if (points === undefined || !Number.isFinite(points) || points < 0 || points > criterion.maxPoints) {
      return null;
    }
    earned += points;
  }
  return earned;
}
