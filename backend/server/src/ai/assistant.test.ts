import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "@google/genai";
import {
  AssistantError,
  createAssistantService,
  DEFAULT_GEMINI_MODEL,
  MAX_ASSISTANT_MESSAGE_LENGTH,
  validateAssistantMessage,
} from "./assistant.js";

test("validates empty and excessively long messages", () => {
  assert.throws(() => validateAssistantMessage("  "), {
    code: "EMPTY_MESSAGE",
    statusCode: 400,
  });
  assert.throws(
    () =>
      validateAssistantMessage("a".repeat(MAX_ASSISTANT_MESSAGE_LENGTH + 1)),
    {
      code: "MESSAGE_TOO_LONG",
      statusCode: 413,
    },
  );
  assert.equal(validateAssistantMessage("  hello  "), "hello");
});

test("uses Gemini and returns the model reply", async () => {
  let receivedApiKey = "";
  let receivedModel = "";
  const generateReply = createAssistantService({
    getApiKey: () => "server-only-test-key",
    getModel: () => DEFAULT_GEMINI_MODEL,
    createClient: (apiKey) => {
      receivedApiKey = apiKey;
      return {
        models: {
          generateContent: async (request) => {
            receivedModel = request.model;
            assert.equal(request.contents, "How do I prepare?");
            return { text: "Practice explaining your projects clearly." };
          },
        },
      };
    },
  });

  const response = await generateReply("How do I prepare?", {
    name: "Sam Lee",
    role: "student",
  });

  assert.equal(receivedApiKey, "server-only-test-key");
  assert.equal(receivedModel, DEFAULT_GEMINI_MODEL);
  assert.equal(response.reply, "Practice explaining your projects clearly.");
  assert.equal(response.model, DEFAULT_GEMINI_MODEL);
});

test("reports a missing API key without creating a provider client", async () => {
  const generateReply = createAssistantService({
    getApiKey: () => undefined,
    createClient: () => {
      throw new Error("Client must not be created without a key");
    },
  });

  await assert.rejects(generateReply("hello"), {
    code: "AI_NOT_CONFIGURED",
    statusCode: 503,
  });
});

test("maps invalid credentials to a safe provider error", async () => {
  const generateReply = createAssistantService({
    getApiKey: () => "invalid-test-key",
    createClient: () => ({
      models: {
        generateContent: async () => {
          throw new ApiError({
            status: 400,
            message:
              "API key is not valid; credential detail must not be returned",
          });
        },
      },
    }),
  });

  await assert.rejects(generateReply("hello"), (error: unknown) => {
    assert.ok(error instanceof AssistantError);
    assert.equal(error.code, "AI_PROVIDER_AUTH_FAILED");
    assert.doesNotMatch(error.message, /credential detail|invalid-test-key/);
    return true;
  });
});

test("reports temporary Gemini unavailability without leaking provider details", async () => {
  const generateReply = createAssistantService({
    getApiKey: () => "test-key",
    createClient: () => ({
      models: {
        generateContent: async () => {
          throw new ApiError({
            status: 503,
            message: "internal provider detail",
          });
        },
      },
    }),
  });

  await assert.rejects(generateReply("hello"), (error: unknown) => {
    assert.ok(error instanceof AssistantError);
    assert.equal(error.code, "AI_PROVIDER_UNAVAILABLE");
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /internal provider detail|test-key/);
    return true;
  });
});

test("maps provider timeouts and errors without leaking provider messages", async (t) => {
  await t.test("timeout", async () => {
    const generateReply = createAssistantService({
      getApiKey: () => "test-key",
      createClient: () => ({
        models: {
          generateContent: async () => {
            throw new Error("request timed out");
          },
        },
      }),
    });

    await assert.rejects(generateReply("hello"), {
      code: "AI_PROVIDER_TIMEOUT",
      statusCode: 504,
    });
  });

  await t.test("provider error", async () => {
    const generateReply = createAssistantService({
      getApiKey: () => "test-key",
      createClient: () => ({
        models: {
          generateContent: async () => {
            throw new Error("provider response included sensitive details");
          },
        },
      }),
    });

    await assert.rejects(generateReply("hello"), (error: unknown) => {
      assert.ok(error instanceof AssistantError);
      assert.equal(error.code, "AI_PROVIDER_ERROR");
      assert.doesNotMatch(error.message, /sensitive details|test-key/);
      return true;
    });
  });
});

test("reports an empty provider response instead of a placeholder answer", async () => {
  const generateReply = createAssistantService({
    getApiKey: () => "test-key",
    createClient: () => ({
      models: {
        generateContent: async () => ({ text: "  " }),
      },
    }),
  });

  await assert.rejects(generateReply("hello"), {
    code: "AI_EMPTY_RESPONSE",
    statusCode: 502,
  });
});
