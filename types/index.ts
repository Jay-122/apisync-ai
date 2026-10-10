export type DependencyStatus =
  | "healthy"
  | "warning"
  | "breaking"
  | "fixing"
  | "fixed";

export type PackageManager = "npm" | "pnpm" | "yarn" | "unknown";

export type Ecosystem = "node" | "python" | "java" | "go" | "unknown";

export type CodebaseDependencyUsage = {
  packageName: string;
  version: string;
  files: string[];
  imports: string[];
  usageCount: number;
};

export type BreakingChange = {
  description: string;
  oldPattern: string;
  newPattern: string;
  confidence: number;
  paramRenames?: Record<string, string>;
};

export type ChangelogAnalysis = {
  package: string;
  fromVersion: string;
  toVersion: string;
  breakingChanges: BreakingChange[];
  source: "catalog" | "llm";
  summary: string;
};

export type FileTransform = {
  path: string;
  original: string;
  modified: string;
  changed: boolean;
  skipped: boolean;
  skipReason?: string;
  confidence: number;
  edits: string[];
};

export type ValidationCheck = {
  id: "ast" | "typescript" | "tests";
  label: string;
  status: "passed" | "failed" | "skipped";
  detail: string;
};

export type TimelineEventName =
  | "started"
  | "dependency_detected"
  | "changelog_parsed"
  | "files_scanned"
  | "transformations_generated"
  | "validation_started"
  | "validation_completed"
  | "pr_created"
  | "pr_blocked";

export type TimelineEvent = {
  name: TimelineEventName;
  at: string;
  detail: string;
};

export type PullRequestProposal = {
  number: number | null;
  title: string;
  body: string;
  branch: string;
  base: string;
  status: "open" | "blocked" | "not_created";
  simulated: boolean;
  url: string | null;
  reviewRequired: boolean;
};

export type MigrationResult = {
  migrationId: string;
  runId: string;
  mode: "demo" | "github";
  status: "completed" | "blocked" | "failed";
  dependency: string;
  fromVersion: string;
  toVersion: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  confidence: number;
  reviewRequired: boolean;
  analysis: ChangelogAnalysis;
  files: FileTransform[];
  validation: {
    typescript: "passed" | "failed" | "skipped";
    tests: "passed" | "failed" | "skipped";
    checks: ValidationCheck[];
  };
  pullRequest: PullRequestProposal;
  timeline: TimelineEvent[];
  explanation: string;
};

export type ScanResult = {
  mode: "demo" | "github";
  repository: string;
  simulated: boolean;
  packageManager: PackageManager;
  ecosystem: Ecosystem;
  manifestPath?: string;
  dependencies: CodebaseDependencyUsage[];
  supported: string[];
  notes: string[];
};
