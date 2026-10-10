import { LanguageModelError, selectLanguageModel } from "@/lib/ai/provider";
import { MIGRATION_RULES } from "@/lib/ast/rules";
import { log } from "@/lib/security/logger";
import type { ChangelogAnalysis } from "@/types";

const SYSTEM_PROMPT = [
  "You extract API migration rules from release notes.",
  "Return only JSON with keys package, fromVersion, toVersion, and breakingChanges.",
  "Each breaking change needs description, oldPattern, newPattern, and confidence between 0 and 1.",
  "Do not include code that should be applied blindly. Describe syntax patterns only.",
].join(" ");

export async function analyzeChangelog(input: {
  packageName: string;
  fromVersion?: string;
  toVersion?: string;
  releaseNotes?: string;
}): Promise<ChangelogAnalysis> {
  const catalog = catalogAnalysis(input);
  if (!input.releaseNotes) return catalog;

  const model = selectLanguageModel();
  if (!model) return catalog;

  try {
    const draft = await model.completeStructured({
      system: SYSTEM_PROMPT,
      prompt: JSON.stringify({
        package: input.packageName,
        fromVersion: input.fromVersion,
        toVersion: input.toVersion,
        releaseNotes: input.releaseNotes,
      }),
    });

    if (draft.package !== input.packageName) return catalog;

    const merged = new Map(catalog.breakingChanges.map((change) => [change.oldPattern, change]));
    for (const change of draft.breakingChanges) {
      if (!merged.has(change.oldPattern)) merged.set(change.oldPattern, change);
    }

    return {
      package: input.packageName,
      fromVersion: draft.fromVersion || catalog.fromVersion,
      toVersion: draft.toVersion || catalog.toVersion,
      breakingChanges: [...merged.values()],
      source: "llm",
      summary: catalog.summary,
    };
  } catch (error) {
    log(
      "changelog_llm_failed",
      { packageName: input.packageName, reason: error instanceof LanguageModelError ? error.message : "unavailable" },
      "warn",
    );
    return catalog;
  }
}

function catalogAnalysis(input: {
  packageName: string;
  fromVersion?: string;
  toVersion?: string;
}): ChangelogAnalysis {
  const rules = MIGRATION_RULES.filter((rule) => rule.packageName === input.packageName);
  const fromVersion = input.fromVersion || rules[0]?.fromVersion || "unknown";
  const toVersion = input.toVersion || rules[0]?.toVersion || "unknown";

  return {
    package: input.packageName,
    fromVersion,
    toVersion,
    source: "catalog",
    summary:
      rules.length > 0
        ? rules[0].description
        : `No vetted migration rule is registered for ${input.packageName}. ApiSync will not rewrite this dependency automatically.`,
    breakingChanges: rules.map((rule) => ({
      description: rule.description,
      oldPattern: rule.oldMethod,
      newPattern: rule.newMethod,
      confidence: rule.confidence,
      paramRenames: rule.paramRenames,
    })),
  };
}
