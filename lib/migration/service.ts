import { analyzeDependencyUsage } from "@/lib/ast/analyzer";
import { AUTO_PROPOSE_THRESHOLD } from "@/lib/ast/rules";
import { transformFile } from "@/lib/ast/transformer";
import { analyzeChangelog } from "@/lib/ai/changelogAnalyzer";
import { DEMO_BRANCH, DEMO_FILES, DEMO_MIGRATION_ID, DEMO_REPOSITORY } from "@/lib/demo/files";
import { detectEcosystem, detectPackageManager, readDependencyVersions } from "@/lib/dependencies/detect";
import { bumpManifestFile, targetDependencyRange } from "@/lib/migration/manifest";
import { diffStats } from "@/lib/diff/stats";
import { buildPullRequest } from "@/lib/github/pr-body";
import { createMigrationPullRequest } from "@/lib/github/pr";
import { scanRepository } from "@/lib/github/scan";
import { recordMigration } from "@/lib/database/store";
import { validateMigration } from "@/lib/validation/engine";
import { ApiError } from "@/lib/security/errors";
import { log } from "@/lib/security/logger";
import type { FileTransform, MigrationResult, TimelineEvent, TimelineEventName } from "@/types";

export async function scanDemo() {
  const paths = DEMO_FILES.map((file) => file.path);
  const manifest = DEMO_FILES.find((file) => file.path === "package.json")?.content ?? "{}";
  const versions = readDependencyVersions(manifest);
  return {
    mode: "demo" as const,
    repository: DEMO_REPOSITORY,
    simulated: true,
    packageManager: detectPackageManager(paths),
    ecosystem: detectEcosystem(paths),
    dependencies: analyzeDependencyUsage(DEMO_FILES, versions),
    supported: ["openai", "stripe", "twilio"],
    notes: [
      "Demo repository. No GitHub API call was made.",
      "Lockfile is not included in the fixture, so the package manager defaults to npm.",
    ],
  };
}

export async function runDemoMigration(): Promise<MigrationResult> {
  const events: TimelineEvent[] = [];
  const mark = (name: TimelineEventName, detail: string) => {
    events.push({ name, at: new Date().toISOString(), detail });
    log(name, { run: "demo", detail });
  };

  mark("started", "Demo migration run started.");
  const scan = await scanDemo();
  const openai = scan.dependencies.find((item) => item.packageName === "openai");
  mark("dependency_detected", openai ? `openai ${openai.version} in ${openai.files.length} files.` : "openai import was not found.");

  const analysis = await analyzeChangelog({
    packageName: "openai",
    fromVersion: "3.x",
    toVersion: "4.x",
    releaseNotes: undefined,
  });
  mark("changelog_parsed", `Catalog rule source: ${analysis.source}.`);
  mark("files_scanned", `${DEMO_FILES.length} demo files indexed.`);

  const transforms = DEMO_FILES.map((file) => {
    if (file.path === "package.json") {
      const range = targetDependencyRange("openai", "4.x") ?? "^4.0.0";
      return bumpManifestFile(file.path, file.content, "openai", range);
    }
    return transformFile({ path: file.path, content: file.content, packageName: "openai" });
  });
  mark("transformations_generated", `${transforms.filter((file) => file.changed).length} files changed.`);

  mark("validation_started", "Parsing rewritten files and running contract checks.");
  const validation = validateMigration(transforms, "demo");
  mark(validation.blocked ? "pr_blocked" : "validation_completed", validation.blocked ? "Validation failed." : "Validation passed.");

  const changed = transforms.filter((file) => file.changed);
  const confidence = changed.length ? Math.min(...changed.map((file) => file.confidence)) : 0;
  const reviewRequired = confidence < AUTO_PROPOSE_THRESHOLD;
  const blocked = validation.blocked || changed.length === 0 || confidence < 0.8;

  const pullRequest = buildPullRequest({
    dependency: "openai",
    fromVersion: analysis.fromVersion,
    toVersion: analysis.toVersion,
    files: changed.map((file) => ({ path: file.path, edits: file.edits })),
    confidence,
    checks: validation.checks,
    simulated: true,
    blocked,
    reviewRequired,
    base: "main",
    number: blocked ? null : 184,
    url: null,
  });
  pullRequest.branch = DEMO_BRANCH;

  if (!blocked) mark("pr_created", "Simulated pull request prepared. Nothing was opened on GitHub.");

  const stats = changed.reduce(
    (sum, file) => {
      const diff = diffStats(file.original, file.modified);
      return { additions: sum.additions + diff.additions, deletions: sum.deletions + diff.deletions };
    },
    { additions: 0, deletions: 0 },
  );

  const result: MigrationResult = {
    migrationId: DEMO_MIGRATION_ID,
    runId: `migration_run_${crypto.randomUUID().slice(0, 8)}`,
    mode: "demo",
    status: blocked ? "blocked" : "completed",
    dependency: "openai",
    fromVersion: analysis.fromVersion,
    toVersion: analysis.toVersion,
    filesChanged: changed.length,
    additions: stats.additions,
    deletions: stats.deletions,
    confidence,
    reviewRequired,
    analysis,
    files: transforms,
    validation: {
      typescript: validation.typescript,
      tests: validation.tests,
      checks: validation.checks,
    },
    pullRequest,
    timeline: events,
    explanation: explanation(analysis.summary, transforms),
  };

  await recordMigration(result);
  return result;
}

export async function runGithubMigration(input: {
  installationId: number;
  owner: string;
  repo: string;
  createPr: boolean;
}) {
  const scan = await scanRepository(input);
  const target = scan.dependencies.find((item) => item.packageName === "openai") ?? scan.dependencies[0];
  if (!target) {
    throw new ApiError(404, "dependency_not_found", "No supported dependency usage was found.");
  }

  const analysis = await analyzeChangelog({
    packageName: target.packageName,
    fromVersion: target.version,
    toVersion: target.packageName === "openai" ? "4.x" : target.version,
  });

  const files: FileTransform[] = [];
  for (const path of target.files) {
    const { readRepositoryFile } = await import("@/lib/github/scan");
    const content = await readRepositoryFile({ ...input, path });
    files.push(transformFile({ path, content, packageName: target.packageName }));
  }

  const range = targetDependencyRange(target.packageName, analysis.toVersion);
  if (range && scan.manifestPath) {
    const { readRepositoryFile } = await import("@/lib/github/scan");
    const manifest = await readRepositoryFile({ ...input, path: scan.manifestPath });
    const bumped = bumpManifestFile(scan.manifestPath, manifest, target.packageName, range);
    if (bumped.changed) {
      files.push(bumped);
    }
  }

  const validation = validateMigration(files, "github");
  const changed = files.filter((file) => file.changed);
  const confidence = changed.length ? Math.min(...changed.map((file) => file.confidence)) : 0;
  const reviewRequired = confidence < AUTO_PROPOSE_THRESHOLD;
  const blocked = validation.blocked || changed.length === 0 || confidence < 0.8;

  let number: number | null = null;
  let url: string | null = null;
  let branch = `apisync/${target.packageName}-sdk-migration`;
  let base = "main";

  if (!blocked && input.createPr) {
    const proposal = buildPullRequest({
      dependency: target.packageName,
      fromVersion: analysis.fromVersion,
      toVersion: analysis.toVersion,
      files: changed.map((file) => ({ path: file.path, edits: file.edits })),
      confidence,
      checks: validation.checks,
      simulated: false,
      blocked: false,
      reviewRequired,
    });
    const created = await createMigrationPullRequest({
      installationId: input.installationId,
      owner: input.owner,
      repo: input.repo,
      branch: proposal.branch,
      title: proposal.title,
      body: proposal.body,
      files: changed.map((file) => ({ path: file.path, content: file.modified })),
    });
    number = created.number;
    url = created.url;
    branch = created.branch;
    base = created.base;
  }

  const pullRequest = buildPullRequest({
    dependency: target.packageName,
    fromVersion: analysis.fromVersion,
    toVersion: analysis.toVersion,
    files: changed.map((file) => ({ path: file.path, edits: file.edits })),
    confidence,
    checks: validation.checks,
    simulated: false,
    blocked: blocked || !input.createPr,
    reviewRequired,
    base,
    number,
    url,
  });
  pullRequest.branch = branch;
  if (!input.createPr && !blocked) pullRequest.status = "not_created";

  const stats = changed.reduce(
    (sum, file) => {
      const diff = diffStats(file.original, file.modified);
      return { additions: sum.additions + diff.additions, deletions: sum.deletions + diff.deletions };
    },
    { additions: 0, deletions: 0 },
  );

  const result: MigrationResult = {
    migrationId: `mig_${crypto.randomUUID().slice(0, 8)}`,
    runId: `migration_run_${crypto.randomUUID().slice(0, 8)}`,
    mode: "github",
    status: blocked ? "blocked" : "completed",
    dependency: target.packageName,
    fromVersion: analysis.fromVersion,
    toVersion: analysis.toVersion,
    filesChanged: changed.length,
    additions: stats.additions,
    deletions: stats.deletions,
    confidence,
    reviewRequired,
    analysis,
    files,
    validation: {
      typescript: validation.typescript,
      tests: validation.tests,
      checks: validation.checks,
    },
    pullRequest,
    timeline: [],
    explanation: explanation(analysis.summary, files),
  };

  await recordMigration(result);
  return result;
}

function explanation(summary: string, files: FileTransform[]) {
  const changed = files.filter((file) => file.changed).map((file) => file.path);
  const skipped = files.filter((file) => file.skipped);
  const skipText = skipped.map((file) => `${file.path}: ${file.skipReason}`).join(" ");
  return [
    summary,
    changed.length ? `ApiSync will propose edits in ${changed.join(", ")}.` : "No file will be edited.",
    skipText ? `Left untouched: ${skipText}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
