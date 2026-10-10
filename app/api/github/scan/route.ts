import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubRepoSchema } from "@/lib/ai/schemas";
import { withApi, readJson } from "@/lib/api/http";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { scanRepository } from "@/lib/github/scan";
import { ApiError } from "@/lib/security/errors";

export const POST = withApi("/api/github/scan", async (request) => {
  const body = githubRepoSchema.parse(await readJson(request));
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before scanning a repository.");
  }

  return NextResponse.json(
    await scanRepository({ installationId, owner: body.owner, repo: body.repo }),
  );
});
