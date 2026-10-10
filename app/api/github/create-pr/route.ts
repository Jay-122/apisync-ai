import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubRepoSchema } from "@/lib/ai/schemas";
import { withApi, readJson } from "@/lib/api/http";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { runGithubMigration } from "@/lib/migration/service";
import { ApiError } from "@/lib/security/errors";

export const POST = withApi("/api/github/create-pr", async (request) => {
  const body = githubRepoSchema.parse(await readJson(request));
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before opening a pull request.");
  }

  const result = await runGithubMigration({
    installationId,
    owner: body.owner,
    repo: body.repo,
    createPr: true,
  });

  if (result.pullRequest.status === "blocked") {
    const failedCheck = result.validation.checks.find((check) => check.status === "failed");
    let message = "Pull request creation is blocked.";
    if (result.filesChanged === 0) {
      message =
        "No files would change. Source may already use the new API on main. ApiSync will still propose a package.json bump when a dependency range is outdated — redeploy the latest app if you expected that.";
    } else if (result.confidence < 0.8) {
      message = `Confidence ${Math.round(result.confidence * 100)}% is below the 80% automatic threshold. Review the diff manually.`;
    } else if (failedCheck) {
      message = `Validation failed: ${failedCheck.detail}`;
    } else {
      message = "Pull request creation is blocked until validation passes and confidence stays above 0.80.";
    }
    return NextResponse.json(
      {
        error: {
          code: "pr_blocked",
          message,
        },
        result,
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    migrationId: result.migrationId,
    status: result.status,
    dependency: result.dependency,
    filesChanged: result.filesChanged,
    confidence: result.confidence,
    validation: {
      typescript: result.validation.typescript,
      tests: result.validation.tests,
    },
    pullRequest: {
      number: result.pullRequest.number,
      status: result.pullRequest.status,
      url: result.pullRequest.url,
      simulated: false,
    },
  });
});
