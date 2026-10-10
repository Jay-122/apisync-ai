import { assertSafeBranch, installationClient } from "@/lib/github/client";
import { ApiError } from "@/lib/security/errors";

export async function createMigrationPullRequest(input: {
  installationId: number;
  owner: string;
  repo: string;
  branch: string;
  title: string;
  body: string;
  files: { path: string; content: string }[];
}) {
  if (input.files.length === 0) {
    throw new ApiError(400, "no_changes", "There are no validated changes to propose.");
  }

  const octokit = await installationClient(input.installationId);
  const repository = await octokit.rest.repos.get({ owner: input.owner, repo: input.repo });
  const base = repository.data.default_branch;
  assertSafeBranch(input.branch, base);

  const ref = await octokit.rest.git.getRef({
    owner: input.owner,
    repo: input.repo,
    ref: `heads/${base}`,
  });

  const branch = await uniqueBranch(octokit, input, input.branch);
  await octokit.rest.git.createRef({
    owner: input.owner,
    repo: input.repo,
    ref: `refs/heads/${branch}`,
    sha: ref.data.object.sha,
  });

  for (const file of input.files) {
    let sha: string | undefined;
    try {
      const existing = await octokit.rest.repos.getContent({
        owner: input.owner,
        repo: input.repo,
        path: file.path,
        ref: branch,
      });
      if (!Array.isArray(existing.data) && existing.data.type === "file") sha = existing.data.sha;
    } catch {
      sha = undefined;
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: input.owner,
      repo: input.repo,
      path: file.path,
      message: `${input.title}\n\n${file.path}`,
      content: Buffer.from(file.content).toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    });
  }

  const pull = await octokit.rest.pulls.create({
    owner: input.owner,
    repo: input.repo,
    title: input.title,
    body: input.body,
    head: branch,
    base,
  });

  return {
    number: pull.data.number,
    url: pull.data.html_url,
    branch,
    base,
  };
}

async function uniqueBranch(
  octokit: Awaited<ReturnType<typeof installationClient>>,
  input: { owner: string; repo: string },
  branch: string,
) {
  try {
    await octokit.rest.git.getRef({
      owner: input.owner,
      repo: input.repo,
      ref: `heads/${branch}`,
    });
  } catch {
    return branch;
  }

  return `${branch}-${Date.now().toString(36)}`;
}
