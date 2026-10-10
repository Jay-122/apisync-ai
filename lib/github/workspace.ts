import { installationClient } from "@/lib/github/client";

export type ConnectedRepository = {
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  url: string;
};

export type InstallationWorkspace = {
  repositories: ConnectedRepository[];
  pullRequests: number;
  mergedPullRequests: number;
};

export async function loadInstallationWorkspace(installationId: number): Promise<InstallationWorkspace> {
  const octokit = await installationClient(installationId);
  const response = await octokit.rest.apps.listReposAccessibleToInstallation({ per_page: 100 });
  const repositories = response.data.repositories.map((repo) => ({
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    url: repo.html_url,
  }));

  let pullRequests = 0;
  let mergedPullRequests = 0;

  for (const repo of repositories) {
    const pulls = await octokit.rest.pulls.list({
      owner: repo.owner,
      repo: repo.name,
      state: "all",
      per_page: 30,
    });
    for (const pull of pulls.data) {
      if (!pull.head.ref.startsWith("apisync/")) continue;
      pullRequests += 1;
      if (pull.merged_at) mergedPullRequests += 1;
    }
  }

  return { repositories, pullRequests, mergedPullRequests };
}
