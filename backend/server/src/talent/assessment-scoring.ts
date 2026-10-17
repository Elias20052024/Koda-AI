export type ScorableQuestion = {
  type: string;
  options: unknown;
  answerKey: unknown;
  maxPoints: string | number;
  reviewedAt: Date | null;
  reviewedByUserId: number | null;
};

export function isReadyQuestion(question: ScorableQuestion) {
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

  let correct = validatedAnswer === question.answerKey;
  if (question.type === "multi_select") {
    const expected = (question.answerKey as string[]).slice().sort();
    correct = Array.isArray(validatedAnswer) &&
      validatedAnswer.length === expected.length &&
      validatedAnswer.slice().sort().every((value, index) => value === expected[index]);
  }
  return correct ? Number(question.maxPoints) : 0;
}
