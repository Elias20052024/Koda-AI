import {
  ApiError,
  GoogleGenAI,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from "@google/genai";

export type AssistantContext = {
  name?: string | null;
  role?: string | null;
};

export const MAX_ASSISTANT_MESSAGE_LENGTH = 10_000;
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_TIMEOUT_MS = 30_000;

export const assistantSuggestions = [
  "Review my dashboard",
  "Find internship matches",
  "Improve my profile",
  "Check my applications",
];

export class AssistantError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AssistantError";
  }
}

type GeminiResponse = Pick<GenerateContentResponse, "text">;

type GeminiClient = {
  models: {
    generateContent: (
      params: GenerateContentParameters,
    ) => Promise<GeminiResponse>;
  };
};

type AssistantServiceOptions = {
  getApiKey?: () => string | undefined;
  getModel?: () => string;
  createClient?: (apiKey: string) => GeminiClient;
};

export function validateAssistantMessage(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AssistantError(
      400,
      "EMPTY_MESSAGE",
      "Enter a message to chat with the AI assistant.",
    );
  }

  const message = value.trim();
  if (message.length > MAX_ASSISTANT_MESSAGE_LENGTH) {
    throw new AssistantError(
      413,
      "MESSAGE_TOO_LONG",
      `Messages must be ${MAX_ASSISTANT_MESSAGE_LENGTH.toLocaleString()} characters or fewer.`,
    );
  }

  return message;
}

function createGeminiClient(apiKey: string): GeminiClient {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: GEMINI_TIMEOUT_MS,
      retryOptions: { attempts: 1 },
    },
  });
}

function getProviderError(error: unknown) {
  if (
    (error instanceof ApiError &&
      (error.status === 408 || error.status === 504)) ||
    (error instanceof Error &&
      (error.name === "AbortError" ||
        error.name === "TimeoutError" ||
        /timed?\s*out|timeout/i.test(error.message)))
  ) {
    return new AssistantError(
      504,
      "AI_PROVIDER_TIMEOUT",
      "The AI assistant timed out. Please try again.",
    );
  }

  if (
    error instanceof ApiError &&
    (error.status === 401 ||
      error.status === 403 ||
      (error.status === 400 &&
        /api.?key|credential|unauthorized/i.test(error.message)))
  ) {
    return new AssistantError(
      502,
      "AI_PROVIDER_AUTH_FAILED",
      "The AI provider rejected its configured credentials. Check the server AI configuration.",
    );
  }

  if (error instanceof ApiError && error.status === 404) {
    return new AssistantError(
      503,
      "AI_MODEL_UNAVAILABLE",
      "The configured Gemini model is unavailable. Check the server GEMINI_MODEL setting.",
    );
  }

  if (
    error instanceof ApiError &&
    (error.status === 429 || error.status === 503)
  ) {
    return new AssistantError(
      503,
      "AI_PROVIDER_UNAVAILABLE",
      "The AI provider is temporarily unavailable. Please try again later.",
    );
  }

  return new AssistantError(
    502,
    "AI_PROVIDER_ERROR",
    "The AI provider could not complete the request. Please try again later.",
  );
}

export function createAssistantService(options: AssistantServiceOptions = {}) {
  const getApiKey = options.getApiKey ?? (() => process.env.GEMINI_API_KEY);
  const getModel =
    options.getModel ??
    (() => process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL);
  const createClient = options.createClient ?? createGeminiClient;

  return async function generateAssistantReply(
    message: string,
    user?: AssistantContext | null,
    instructions?: string,
  ) {
    const apiKey = getApiKey()?.trim();
    if (!apiKey) {
      throw new AssistantError(
        503,
        "AI_NOT_CONFIGURED",
        "The AI assistant is not configured on the server. Contact the site administrator.",
      );
    }

    const firstName = user?.name?.trim().split(/\s+/)[0];
    const role = user?.role?.trim() || "guest";
    const contextInstruction = `The current user's role is ${role}.${firstName ? ` Their first name is ${firstName}.` : ""}`;
    const systemInstruction = instructions
      ? `${instructions} ${contextInstruction}`
      : [
          "You are Koda AI, a helpful career and internship assistant for students, companies, and universities.",
          "Give practical, concise, truthful guidance. Do not claim to have searched account data or performed actions unless that data is provided.",
          contextInstruction,
        ].join(" ");
    const model = getModel();

    try {
      const client = createClient(apiKey);
      const response = await client.models.generateContent({
        model,
        contents: message,
        config: { systemInstruction },
      });
      const reply = response.text?.trim();

      if (!reply) {
        throw new AssistantError(
          502,
          "AI_EMPTY_RESPONSE",
          "The AI provider returned an empty response. Please try again.",
        );
      }

      return { reply, model, suggestions: assistantSuggestions };
    } catch (error) {
      if (error instanceof AssistantError) throw error;
      throw getProviderError(error);
    }
  };
}

export const generateAssistantReply = createAssistantService();
