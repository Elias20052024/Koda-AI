export type RubricCriterion = {
  criterion: string;
  maxPoints: number;
};

export type AssessmentQuestionInput = {
  type: "single_choice" | "multi_select" | "scenario" | "code_reading" | "short_answer";
  prompt: string;
  options: { id: string; label: string }[] | null;
  answerKey: string | string[] | Record<string, never>;
  rubric: RubricCriterion[] | null;
  maxPoints: number;
  explanation: string;
};

const objectiveQuestionTypes = ["single_choice", "multi_select", "scenario", "code_reading"] as const;

type ObjectiveQuestionType = typeof objectiveQuestionTypes[number];

function isObjectiveQuestionType(type: string): type is ObjectiveQuestionType {
  return (objectiveQuestionTypes as readonly string[]).includes(type);
}

export function parseAssessmentQuestions(response: string, expectedCount: number): AssessmentQuestionInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error("Question content is not valid JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("questions" in parsed) ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length !== expectedCount
  ) {
    throw new Error("Question content does not contain the requested number of questions.");
  }

  return parsed.questions.map((value: unknown) => {
    if (!value || typeof value !== "object") {
      throw new Error("Question content contains an invalid question.");
    }
    const question = value as Record<string, unknown>;
    const type = question.type;
    const prompt = typeof question.prompt === "string" ? question.prompt.trim() : "";
    const explanation = typeof question.explanation === "string" ? question.explanation.trim() : "";
    const maxPoints = question.maxPoints === undefined ? 1 : Number(question.maxPoints);
    if (
      typeof type !== "string" ||
      (!isObjectiveQuestionType(type) && type !== "short_answer") ||
      !prompt ||
      prompt.length > 2000 ||
      explanation.length > 2000 ||
      !Number.isFinite(maxPoints) ||
      maxPoints <= 0 ||
      maxPoints > 1000
    ) {
      throw new Error("Question content contains an invalid type, prompt, explanation, or point value.");
    }

    if (type === "short_answer") {
      if (!Array.isArray(question.rubric) || question.rubric.length === 0 || question.rubric.length > 20) {
        throw new Error("Subjective questions require one or more rubric criteria.");
      }
      const rubric = question.rubric.map((value: unknown) => {
        if (!value || typeof value !== "object") {
          throw new Error("Rubric criteria must be objects.");
        }
        const criterion = value as Record<string, unknown>;
        const description = typeof criterion.criterion === "string" ? criterion.criterion.trim() : "";
        const points = Number(criterion.maxPoints);
        if (!description || description.length > 500 || !Number.isFinite(points) || points <= 0) {
          throw new Error("Rubric criteria require a description and positive point value.");
        }
        return { criterion: description, maxPoints: points };
      });
      const rubricPoints = rubric.reduce((sum, criterion) => sum + criterion.maxPoints, 0);
      if (Math.abs(rubricPoints - maxPoints) > 0.001) {
        throw new Error("Rubric criterion points must add up to the question's maximum points.");
      }
      return {
        type,
        prompt,
        options: null,
        answerKey: {},
        rubric,
        maxPoints,
        explanation,
      };
    }

    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 10) {
      throw new Error("Objective questions require between 2 and 10 answer choices.");
    }
    const options = question.options.map((option: unknown) => {
      if (!option || typeof option !== "object") {
        throw new Error("Question choices must be objects.");
      }
      const choice = option as Record<string, unknown>;
      const id = typeof choice.id === "string" ? choice.id.trim() : "";
      const label = typeof choice.label === "string" ? choice.label.trim() : "";
      if (!/^[a-z0-9_-]{1,20}$/i.test(id) || !label || label.length > 500) {
        throw new Error("Question content contains an invalid answer choice.");
      }
      return { id, label };
    });
    const optionIds = new Set(options.map((option) => option.id));
    if (optionIds.size !== options.length) {
      throw new Error("Question content contains duplicate answer choice identifiers.");
    }

    let answerKey: string | string[];
    if (type === "multi_select") {
      if (
        !Array.isArray(question.answerKey) ||
        question.answerKey.length === 0 ||
        question.answerKey.some((answer) => typeof answer !== "string" || !optionIds.has(answer)) ||
        new Set(question.answerKey).size !== question.answerKey.length
      ) {
        throw new Error("Multi-select questions require a valid list of correct answer identifiers.");
      }
      answerKey = question.answerKey as string[];
    } else {
      if (typeof question.answerKey !== "string" || !optionIds.has(question.answerKey)) {
        throw new Error("Question content contains an invalid answer key.");
      }
      answerKey = question.answerKey;
    }

    return { type, prompt, options, answerKey, rubric: null, maxPoints, explanation };
  });
}
