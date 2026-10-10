import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { installationClient } from "@/lib/github/client";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { withApi } from "@/lib/api/http";
import { ApiError } from "@/lib/security/errors";

export const GET = withApi("/api/github/repos", async () => {
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before listing repositories.");
  }

  const octokit = await installationClient(installationId);
  const response = await octokit.rest.apps.listReposAccessibleToInstallation({ per_page: 100 });
  return NextResponse.json({
    simulated: false,
    repositories: response.data.repositories.map((repo) => ({
      owner: repo.owner.login,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      defaultBranch: repo.default_branch,
    })),
  });
});
