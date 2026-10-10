import { parseSource, typecheckSources } from "@/lib/ast/validator";
import { diffStats } from "@/lib/diff/stats";
import type { FileTransform, ValidationCheck } from "@/types";

export function validateMigration(files: FileTransform[], mode: "demo" | "github") {
  const changed = files.filter((file) => file.changed);
  const scripts = changed.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file.path));
  const syntaxFailures = scripts.filter((file) => !parseSource(file.path, file.modified).valid);
  const typecheck = typecheckSources(scripts.map((file) => ({ path: file.path, content: file.modified })));
  const contractFailures = contractFailuresFor(changed);

  const ast: ValidationCheck = {
    id: "ast",
    label: "AST valid",
    status: syntaxFailures.length === 0 ? "passed" : "failed",
    detail:
      syntaxFailures.length === 0
        ? "Rewritten files parsed successfully."
        : "A rewritten file failed to parse.",
  };

  const typescript: ValidationCheck = {
    id: "typescript",
    label: "TypeScript syntax valid",
    status: typecheck.valid ? "passed" : "failed",
    detail: typecheck.valid
      ? "Re-parsed with a bounded typecheck. Repository node_modules were not loaded."
      : typecheck.diagnostics.slice(0, 3).join(" "),
  };

  const tests: ValidationCheck = {
    id: "tests",
    label: mode === "demo" ? "Demo contract checks" : "Repository tests",
    status: contractFailures.length === 0 ? "passed" : "failed",
    detail:
      contractFailures.length === 0
        ? mode === "demo"
          ? "Static contract checks passed. The demo does not execute a package test script."
          : "Static contract checks passed. ApiSync does not execute repository scripts."
        : contractFailures.join(" "),
  };

  if (mode === "github") {
    tests.status = contractFailures.length === 0 ? "skipped" : "failed";
    tests.detail =
      contractFailures.length === 0
        ? "Repository test execution requires explicit authorization and is disabled. Static checks found no contract failures."
        : contractFailures.join(" ");
  }

  const blocked = [ast, typescript, tests].some((check) => check.status === "failed");

  return {
    typescript: typescript.status,
    tests: tests.status,
    checks: [ast, typescript, tests],
    blocked,
  };
}

function contractFailuresFor(files: FileTransform[]) {
  const failures: string[] = [];
  for (const file of files) {
    if (file.skipped && file.modified !== file.original) {
      failures.push(`${file.path} was marked skipped but changed.`);
    }
    if (file.edits.some((edit) => edit.includes("completions.create")) && file.modified.includes("createCompletion(")) {
      failures.push(`${file.path} still contains createCompletion(.`);
    }
    if (file.edits.some((edit) => edit.includes("engine → model")) && /\bengine\s*:/.test(file.modified)) {
      failures.push(`${file.path} still assigns engine.`);
    }
    const stats = diffStats(file.original, file.modified);
    if (file.changed && stats.additions + stats.deletions === 0) {
      failures.push(`${file.path} was marked changed without a diff.`);
    }
  }
  return failures;
}
