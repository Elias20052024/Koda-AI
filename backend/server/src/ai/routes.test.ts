import assert from "node:assert/strict";
import { test } from "node:test";
import Fastify from "fastify";
import { AssistantError, MAX_ASSISTANT_MESSAGE_LENGTH } from "./assistant.js";
import { registerAiChatRoute } from "./routes.js";

test("chat route returns a model response and preserves user context", async (t) => {
  const app = Fastify();
  registerAiChatRoute(app, {
    resolveUser: async () => ({ name: "Taylor Student", role: "student" }),
    generateReply: async (message, user) => ({
      reply: `Generated guidance for: ${message} (${user?.role})`,
      model: "gemini-test-model",
      suggestions: ["Review my profile"],
    }),
  });
  t.after(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/api/ai/chat",
    payload: { message: "How should I prepare?" },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    reply: "Generated guidance for: How should I prepare? (student)",
    model: "gemini-test-model",
    suggestions: ["Review my profile"],
    role: "student",
  });
});

test("chat route rejects empty and excessively long messages without calling Gemini", async (t) => {
  let called = false;
  const app = Fastify();
  registerAiChatRoute(app, {
    generateReply: async () => {
      called = true;
      return { reply: "unexpected", model: "test-model", suggestions: [] };
    },
  });
  t.after(() => app.close());

  const emptyResponse = await app.inject({
    method: "POST",
    url: "/api/ai/chat",
    payload: { message: "  " },
  });
  const longResponse = await app.inject({
    method: "POST",
    url: "/api/ai/chat",
    payload: { message: "a".repeat(MAX_ASSISTANT_MESSAGE_LENGTH + 1) },
  });

  assert.equal(emptyResponse.statusCode, 400);
  assert.equal(emptyResponse.json().code, "EMPTY_MESSAGE");
  assert.equal(longResponse.statusCode, 413);
  assert.equal(longResponse.json().code, "MESSAGE_TOO_LONG");
  assert.equal(called, false);
});

test("chat route returns a safe unavailable error when the server has no provider key", async (t) => {
  const app = Fastify();
  registerAiChatRoute(app, {
    generateReply: async () => {
      throw new AssistantError(
        503,
        "AI_NOT_CONFIGURED",
        "AI server configuration is missing.",
      );
    },
  });
  t.after(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/api/ai/chat",
    payload: { message: "hello" },
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "AI_NOT_CONFIGURED");
});

test("chat route maps invalid credentials, provider failures, and timeouts to safe errors", async (t) => {
  const cases = [
    {
      code: "AI_PROVIDER_AUTH_FAILED",
      statusCode: 502,
      message: "Credentials rejected.",
    },
    { code: "AI_PROVIDER_ERROR", statusCode: 502, message: "Provider failed." },
    {
      code: "AI_PROVIDER_TIMEOUT",
      statusCode: 504,
      message: "Provider timed out.",
    },
  ];

  for (const error of cases) {
    await t.test(error.code, async (nested) => {
      const app = Fastify();
      registerAiChatRoute(app, {
        generateReply: async () => {
          throw new AssistantError(error.statusCode, error.code, error.message);
        },
      });
      nested.after(() => app.close());

      const response = await app.inject({
        method: "POST",
        url: "/api/ai/chat",
        payload: { message: "hello" },
      });

      assert.equal(response.statusCode, error.statusCode);
      assert.deepEqual(response.json(), {
        error: error.message,
        code: error.code,
      });
    });
  }
});
