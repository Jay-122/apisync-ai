import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { withApi, readJson } from "@/lib/api/http";
import { assertSafeBranch, installationClient } from "@/lib/github/client";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { ApiError } from "@/lib/security/errors";

const schema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  branch: z.string().regex(/^apisync\/[a-z0-9._/-]+$/i),
});

export const POST = withApi("/api/github/create-branch", async (request) => {
  const body = schema.parse(await readJson(request));
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before creating a branch.");
  }

  const octokit = await installationClient(installationId);
  const repository = await octokit.rest.repos.get({ owner: body.owner, repo: body.repo });
  assertSafeBranch(body.branch, repository.data.default_branch);
  const baseRef = await octokit.rest.git.getRef({
    owner: body.owner,
    repo: body.repo,
    ref: `heads/${repository.data.default_branch}`,
  });

  const created = await octokit.rest.git.createRef({
    owner: body.owner,
    repo: body.repo,
    ref: `refs/heads/${body.branch}`,
    sha: baseRef.data.object.sha,
  });

  return NextResponse.json({
    simulated: false,
    branch: body.branch,
    base: repository.data.default_branch,
    ref: created.data.ref,
  });
});
