import { changelogSchema, type ChangelogDraft } from "@/lib/ai/schemas";

export type StructuredRequest = {
  system: string;
  prompt: string;
};

export interface LanguageModel {
  id: string;
  provider: "openai" | "anthropic";
  completeStructured(request: StructuredRequest): Promise<ChangelogDraft>;
}

export class LanguageModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LanguageModelError";
  }
}

export function parseModelJson(raw: string): ChangelogDraft {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new LanguageModelError("Model did not return JSON.");
  }
  const result = changelogSchema.safeParse(parsed);
  if (!result.success) {
    throw new LanguageModelError("Model JSON failed schema validation.");
  }
  return result.data;
}

export function selectLanguageModel(): LanguageModel | null {
  const preferred = process.env.AI_PROVIDER;
  if (preferred === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return createAnthropicModel();
  }
  if (process.env.OPENAI_API_KEY && preferred !== "anthropic") {
    return createOpenAIModel();
  }
  if (process.env.ANTHROPIC_API_KEY) return createAnthropicModel();
  return null;
}

function createOpenAIModel(): LanguageModel {
  return {
    id: process.env.OPENAI_MODEL || "gpt-4o-mini",
    provider: "openai",
    completeStructured: async (request) => {
      const { completeOpenAI } = await import("@/lib/ai/openai");
      return completeOpenAI(request);
    },
  };
}

function createAnthropicModel(): LanguageModel {
  return {
    id: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
    provider: "anthropic",
    completeStructured: async (request) => {
      const { completeAnthropic } = await import("@/lib/ai/anthropic");
      return completeAnthropic(request);
    },
  };
}
