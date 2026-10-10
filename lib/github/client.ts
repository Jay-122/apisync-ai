import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";
import { assertGithubConfigured } from "@/lib/github/config";

export async function installationClient(installationId: number) {
  const config = assertGithubConfigured();
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: config.appId!,
      privateKey: config.privateKey!,
      installationId,
    },
  });
}

export function assertSafeBranch(branch: string, base: string) {
  if (branch === base || branch === "main" || branch === "master") {
    throw new Error("Refusing to push directly to the default branch.");
  }
  if (!branch.startsWith("apisync/")) {
    throw new Error("Refusing to write outside an apisync/* branch.");
  }
}
