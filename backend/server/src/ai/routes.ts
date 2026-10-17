import type { FastifyInstance } from "fastify";
import {
  AssistantError,
  generateAssistantReply,
  validateAssistantMessage,
  type AssistantContext,
} from "./assistant.js";

type AssistantGenerator = typeof generateAssistantReply;

type AiRouteOptions = {
  generateReply?: AssistantGenerator;
  resolveUser?: (authorization: string) => Promise<AssistantContext | null>;
};

export function registerAiChatRoute(
  app: FastifyInstance,
  options: AiRouteOptions = {},
) {
  const generateReply = options.generateReply ?? generateAssistantReply;
  const resolveUser = options.resolveUser ?? (async () => null);

  app.post("/api/ai/chat", async (request, reply) => {
    try {
      const body = request.body;
      const message = validateAssistantMessage(
        typeof body === "object" && body !== null && !Array.isArray(body)
          ? (body as { message?: unknown }).message
          : undefined,
      );
      const user = await resolveUser(request.headers.authorization ?? "");
      const response = await generateReply(message, user);

      return {
        ...response,
        role: user?.role ?? "guest",
      };
    } catch (error) {
      if (error instanceof AssistantError) {
        reply.code(error.statusCode);
        return { error: error.message, code: error.code };
      }

      throw error;
    }
  });
}
