import { analyzeDependencyUsage } from "@/lib/ast/analyzer";
import { detectEcosystem, detectPackageManager, readDependencyVersions } from "@/lib/dependencies/detect";
import { installationClient } from "@/lib/github/client";
import { ApiError } from "@/lib/security/errors";
import type { ScanResult } from "@/types";

const SOURCE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const MAX_FILES = 80;
const MAX_BYTES = 150_000;

export async function scanRepository(input: {
  installationId: number;
  owner: string;
  repo: string;
}): Promise<ScanResult> {
  const octokit = await installationClient(input.installationId);
  const repository = await octokit.rest.repos.get({ owner: input.owner, repo: input.repo });
  const branch = repository.data.default_branch;
  const tree = await octokit.rest.git.getTree({
    owner: input.owner,
    repo: input.repo,
    tree_sha: branch,
    recursive: "true",
  });

  const paths = tree.data.tree.map((item) => item.path).filter((path): path is string => Boolean(path));
  const ecosystem = detectEcosystem(paths);
  const notes = [
    "Scan read the git tree and a bounded set of source files. Repository scripts were not executed.",
  ];

  if (ecosystem === "python" || ecosystem === "java" || ecosystem === "go") {
    notes.push(`${ecosystem} repositories are detected but not transformed yet.`);
  }

  const manifestPath =
    paths.find((path) => path === "package.json") ??
    paths.find((path) => path.endsWith("/package.json"));
  if (!manifestPath) {
    return {
      mode: "github",
      repository: `${input.owner}/${input.repo}`,
      simulated: false,
      packageManager: detectPackageManager(paths),
      ecosystem,
      dependencies: [],
      supported: ["openai", "stripe", "twilio"],
      notes: [...notes, "No package.json was found, so Node dependencies could not be indexed."],
    };
  }

  const manifest = await readFile(octokit, input, manifestPath);
  const versions = readDependencyVersions(manifest);
  const candidates = paths
    .filter((path) => SOURCE.test(path) && !path.includes("node_modules") && !path.includes(".next"))
    .slice(0, MAX_FILES);

  const files: { path: string; content: string }[] = [];
  for (const path of candidates) {
    const content = await readFile(octokit, input, path);
    if (content.length <= MAX_BYTES) files.push({ path, content });
  }

  if (candidates.length >= MAX_FILES) {
    notes.push(`Indexed the first ${MAX_FILES} source files. Narrow the repository or request a path filter for the rest.`);
  }

return {
      mode: "github",
      repository: `${input.owner}/${input.repo}`,
      simulated: false,
      packageManager: detectPackageManager(paths),
      ecosystem,
      manifestPath,
      dependencies: analyzeDependencyUsage(files, versions),
      supported: ["openai", "stripe", "twilio"],
      notes,
    };
}

async function readFile(
  octokit: Awaited<ReturnType<typeof installationClient>>,
  input: { owner: string; repo: string },
  path: string,
) {
  const response = await octokit.rest.repos.getContent({
    owner: input.owner,
    repo: input.repo,
    path,
  });

  if (Array.isArray(response.data) || response.data.type !== "file" || !("content" in response.data)) {
    throw new ApiError(404, "file_not_found", `Could not read ${path}.`);
  }

  return Buffer.from(response.data.content, "base64").toString("utf8");
}

export async function readRepositoryFile(input: {
  installationId: number;
  owner: string;
  repo: string;
  path: string;
}) {
  const octokit = await installationClient(input.installationId);
  return readFile(octokit, input, input.path);
}
