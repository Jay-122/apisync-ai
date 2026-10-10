import { Project, ScriptKind } from "ts-morph";
import { planFileEdits } from "@/lib/ast/planner";
import { AUTO_TRANSFORM_THRESHOLD, rulesForPackage } from "@/lib/ast/rules";
import { parseSource } from "@/lib/ast/validator";
import type { FileTransform } from "@/types";

export function transformFile(input: {
  path: string;
  content: string;
  packageName: string;
}): FileTransform {
  if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(input.path)) {
    return base(input, {
      skipped: false,
      skipReason: "Only TypeScript and JavaScript files are transformed with the AST engine.",
      confidence: 1,
    });
  }

  const rules = rulesForPackage(input.packageName);
  if (rules.length === 0) {
    return base(input, {
      skipped: false,
      skipReason: "No migration rule is registered for this dependency.",
      confidence: 1,
    });
  }

  const original = parseSource(input.path, input.content);
  if (!original.valid) {
    return base(input, {
      skipped: true,
      skipReason: "Transformation skipped. Reason: source could not be parsed.",
      confidence: 0,
    });
  }

  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
  });
  const source = project.createSourceFile(input.path, input.content, {
    overwrite: true,
    scriptKind: scriptKind(input.path),
  });

  const plan = planFileEdits(source, rules);
  if (!plan.ok) {
    return base(input, { skipped: true, skipReason: plan.reason, confidence: 0 });
  }

  if (plan.edits.length === 0) {
    return base(input, {
      skipped: false,
      skipReason: "No safe AST match for the registered migration rules.",
      confidence: 1,
    });
  }

  const confidence = Math.min(...plan.edits.map((edit) => edit.confidence));
  if (confidence < AUTO_TRANSFORM_THRESHOLD) {
    return base(input, {
      skipped: true,
      skipReason: `Transformation skipped. Reason: confidence ${confidence.toFixed(2)} is below 0.80.`,
      confidence,
    });
  }

  for (const edit of plan.edits) edit.apply();
  const modified = source.getFullText();
  const reparsed = parseSource(input.path, modified);
  if (!reparsed.valid) {
    return base(input, {
      skipped: true,
      skipReason: "Transformation skipped. Reason: rewritten source failed to parse.",
      confidence: 0,
    });
  }

  return {
    path: input.path,
    original: input.content,
    modified,
    changed: modified !== input.content,
    skipped: false,
    confidence,
    edits: [...new Set(plan.edits.map((edit) => edit.description))],
  };
}

function base(
  input: { path: string; content: string },
  extra: { skipped: boolean; skipReason: string; confidence: number },
): FileTransform {
  return {
    path: input.path,
    original: input.content,
    modified: input.content,
    changed: false,
    skipped: extra.skipped,
    skipReason: extra.skipReason,
    confidence: extra.confidence,
    edits: [],
  };
}

function scriptKind(path: string) {
  if (path.endsWith(".tsx")) return ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ScriptKind.JSX;
  if (path.endsWith(".js") || path.endsWith(".mjs") || path.endsWith(".cjs")) return ScriptKind.JS;
  return ScriptKind.TS;
}
