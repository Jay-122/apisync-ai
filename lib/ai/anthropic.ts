import { LanguageModelError, parseModelJson, type StructuredRequest } from "@/lib/ai/provider";

export async function completeAnthropic(request: StructuredRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new LanguageModelError("Anthropic API key is not configured.");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(20_000),
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 1200,
      temperature: 0,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
    }),
  });

  if (!response.ok) {
    throw new LanguageModelError(`Anthropic request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };
  const content = payload.content?.find((block) => block.type === "text")?.text;
  if (!content) throw new LanguageModelError("Anthropic returned an empty completion.");
  return parseModelJson(content);
}
