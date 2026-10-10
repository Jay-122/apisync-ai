import { LanguageModelError, parseModelJson, type StructuredRequest } from "@/lib/ai/provider";

export async function completeOpenAI(request: StructuredRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new LanguageModelError("OpenAI API key is not configured.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(20_000),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new LanguageModelError(`OpenAI request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new LanguageModelError("OpenAI returned an empty completion.");
  return parseModelJson(content);
}
