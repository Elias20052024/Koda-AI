export type QuestionDraft = {
  prompt: string;
  options: { id: string; label: string }[];
  answerKey: string;
  explanation: string;
};

export function parseQuestionDrafts(response: string, expectedCount: number): QuestionDraft[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("questions" in parsed) ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length !== expectedCount
  ) {
    throw new Error("AI response did not contain the requested number of questions.");
  }

  return parsed.questions.map((value: unknown) => {
    if (!value || typeof value !== "object") {
      throw new Error("AI response contained an invalid question.");
    }
    const question = value as Record<string, unknown>;
    const prompt = typeof question.prompt === "string" ? question.prompt.trim() : "";
    const explanation = typeof question.explanation === "string" ? question.explanation.trim() : "";
    if (!prompt || prompt.length > 2000 || !explanation || explanation.length > 2000) {
      throw new Error("AI response contained an invalid prompt or explanation.");
    }
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 5) {
      throw new Error("AI response contained an invalid set of choices.");
    }

    const options = question.options.map((option: unknown) => {
      if (!option || typeof option !== "object") {
        throw new Error("AI response contained an invalid choice.");
      }
      const choice = option as Record<string, unknown>;
      const id = typeof choice.id === "string" ? choice.id.trim() : "";
      const label = typeof choice.label === "string" ? choice.label.trim() : "";
      if (!/^[a-z0-9_-]{1,20}$/i.test(id) || !label || label.length > 500) {
        throw new Error("AI response contained an invalid choice.");
      }
      return { id, label };
    });
    const optionIds = new Set(options.map((option: { id: string }) => option.id));
    if (optionIds.size !== options.length) {
      throw new Error("AI response contained duplicate choice identifiers.");
    }

    const answerKey = typeof question.answerKey === "string" ? question.answerKey : "";
    if (!optionIds.has(answerKey)) {
      throw new Error("AI response contained an invalid answer key.");
    }

    return { prompt, options, answerKey, explanation };
  });
}
