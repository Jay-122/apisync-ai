import { describe, expect, it } from "vitest";
import { analyzeDependencyUsage } from "@/lib/ast/analyzer";
import { transformFile } from "@/lib/ast/transformer";
import { assertSafeBranch } from "@/lib/github/client";
import { buildPullRequest } from "@/lib/github/pr-body";
import { receiveWebhook } from "@/lib/github/webhook";
import { analyzeChangelog } from "@/lib/ai/changelogAnalyzer";
import { parseModelJson } from "@/lib/ai/provider";
import { runDemoMigration } from "@/lib/migration/service";
import { redact } from "@/lib/security/logger";
import { rateLimit } from "@/lib/security/rate-limit";

const completion = `import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function keep() {
  return "untouched";
}

export async function complete(prompt: string) {
  const response = await openai.createCompletion({
    engine: "gpt-3.5-turbo",
    prompt,
    max_tokens: 20,
  });
  return response.data.choices[0]?.text ?? "";
}
`;

describe("AST transformation", () => {
  it("rewrites createCompletion and preserves unrelated code", () => {
    const result = transformFile({ path: "src/lib/openai.ts", content: completion, packageName: "openai" });
    expect(result.changed).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.modified).toContain("openai.completions.create");
    expect(result.modified).toContain('model: "gpt-3.5-turbo"');
    expect(result.modified).toContain("response.choices[0]?.text");
    expect(result.modified).not.toContain("createCompletion");
    expect(result.modified).not.toContain("response.data");
    expect(result.modified).toContain('return "untouched"');
    expect(result.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it("rewrites nested calls", () => {
    const source = `declare function wrap(value: unknown): unknown;
const openai = { createCompletion: (_input: unknown) => ({}) };
wrap(openai.createCompletion({ engine: "gpt-3.5-turbo", prompt: "Hello" }));
`;
    const result = transformFile({ path: "nested.ts", content: source, packageName: "openai" });
    expect(result.modified).toContain("openai.completions.create");
    expect(result.modified).toContain("model:");
  });

  it("does not modify a shorthand property match", () => {
    const source = `const openai = { createCompletion: (_input: unknown) => ({ data: { choices: [{ text: "" }] } }) };
export async function unsafe(prompt: string) {
  const engine = "gpt-3.5-turbo";
  const response = await openai.createCompletion({ engine, prompt });
  return response.data.choices[0]?.text ?? "";
}
`;
    const result = transformFile({ path: "unsafe.ts", content: source, packageName: "openai" });
    expect(result.skipped).toBe(true);
    expect(result.modified).toBe(source);
    expect(result.skipReason).toContain("did not match safely");
  });

  it("does not modify a non-matching call shape", () => {
    const source = `const openai = { createCompletion: (_input: string) => _input };
openai.createCompletion("raw");
`;
    const result = transformFile({ path: "raw.ts", content: source, packageName: "openai" });
    expect(result.skipped).toBe(true);
    expect(result.modified).toBe(source);
  });

  it("indexes imports without treating the import itself as a call site", () => {
    const usage = analyzeDependencyUsage(
      [{ path: "src/lib/openai.ts", content: completion }],
      { openai: "^3.3.0" },
    );
    expect(usage[0]?.packageName).toBe("openai");
    expect(usage[0]?.files).toContain("src/lib/openai.ts");
    expect(usage[0]?.imports).toContain("OpenAI");
    expect(usage[0]?.usageCount).toBeGreaterThan(0);
  });
});

describe("demo migration", () => {
  it(
    "detects, transforms, validates, and simulates a pull request",
    async () => {
    const result = await runDemoMigration();
    expect(result.mode).toBe("demo");
    expect(result.status).toBe("completed");
    expect(result.pullRequest.simulated).toBe(true);
    expect(result.pullRequest.branch.startsWith("apisync/")).toBe(true);
    expect(result.pullRequest.branch).not.toBe("main");
    expect(result.validation.typescript).toBe("passed");
    expect(result.validation.tests).toBe("passed");
    expect(result.filesChanged).toBeGreaterThanOrEqual(4);
    const manifest = result.files.find((file) => file.path === "package.json");
    expect(manifest?.changed).toBe(true);
    expect(manifest?.modified).toContain('"openai": "^4.0.0"');
    const rewritten = result.files.find((file) => file.path === "src/lib/openai.ts");
    expect(rewritten?.modified).toContain("completions.create");
    const skipped = result.files.find((file) => file.path === "src/experiments/unsafe-call.ts");
    expect(skipped?.skipped).toBe(true);
    expect(skipped?.modified).toBe(skipped?.original);
    },
    20_000,
  );
});

describe("safety and API contracts", () => {
  it("rejects invalid model JSON", () => {
    expect(() => parseModelJson("not-json")).toThrow(/JSON/);
    expect(() => parseModelJson(JSON.stringify({ package: "openai" }))).toThrow(/schema/);
  });

  it("uses the catalog when no release notes are provided", async () => {
    const analysis = await analyzeChangelog({ packageName: "openai" });
    expect(analysis.source).toBe("catalog");
    expect(analysis.breakingChanges[0]?.oldPattern).toBe("createCompletion");
  });

  it("refuses the default branch", () => {
    expect(() => assertSafeBranch("main", "main")).toThrow(/default branch/);
    expect(() => assertSafeBranch("apisync/openai-sdk-migration", "main")).not.toThrow();
  });

  it("blocks webhook delivery when the secret is missing", async () => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    const result = await receiveWebhook("{}", "sha256=abc", "push");
    expect(result.status).toBe(503);
  });

  it("redacts secrets and rate limits a key", () => {
    expect(redact({ privateKey: "secret", repository: "acme/app" })).toMatchObject({
      privateKey: "[redacted]",
      repository: "acme/app",
    });
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 1).ok).toBe(true);
    expect(rateLimit(key, 1).ok).toBe(false);
  });

  it("builds a reviewable pull request body", () => {
    const proposal = buildPullRequest({
      dependency: "openai",
      fromVersion: "3.x",
      toVersion: "4.x",
      files: [{ path: "src/lib/openai.ts", edits: ["createCompletion() → completions.create()"] }],
      confidence: 0.97,
      checks: [{ id: "ast", label: "AST valid", status: "passed", detail: "ok" }],
      simulated: true,
      blocked: false,
      reviewRequired: false,
      number: 184,
    });
    expect(proposal.title).toBe("chore: migrate OpenAI SDK usage");
    expect(proposal.body).toContain("97%");
    expect(proposal.body).toContain("Merge stays manual");
    expect(proposal.body).toContain("was not opened on GitHub");
    expect(proposal.simulated).toBe(true);
  });
});
