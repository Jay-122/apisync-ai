import { NextResponse } from "next/server";
import { migrationRequestSchema } from "@/lib/ai/schemas";
import { withApi, readJson } from "@/lib/api/http";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { runDemoMigration, runGithubMigration } from "@/lib/migration/service";
import { ApiError } from "@/lib/security/errors";
import { cookies } from "next/headers";

export const POST = withApi("/api/migration/run", async (request) => {
  const body = migrationRequestSchema.parse(await readJson(request));
  if (body.mode === "demo") {
    return NextResponse.json(await runDemoMigration());
  }

  if (!body.owner || !body.repo) {
    throw new ApiError(400, "invalid_input", "Owner and repo are required.");
  }

  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before migrating a repository.");
  }

  return NextResponse.json(
    await runGithubMigration({
      installationId,
      owner: body.owner,
      repo: body.repo,
      createPr: Boolean(body.createPr),
    }),
  );
});
