import { NextResponse } from "next/server";
import { scanRequestSchema } from "@/lib/ai/schemas";
import { withApi, readJson } from "@/lib/api/http";
import { scanDemo } from "@/lib/migration/service";
import { scanRepository } from "@/lib/github/scan";
import { readInstallationId, INSTALLATION_COOKIE } from "@/lib/github/session";
import { ApiError } from "@/lib/security/errors";
import { cookies } from "next/headers";

export const POST = withApi("/api/scan", async (request) => {
  const body = scanRequestSchema.parse(await readJson(request));
  if (body.mode === "demo") {
    return NextResponse.json(await scanDemo());
  }

  if (!body.owner || !body.repo) {
    throw new ApiError(400, "invalid_input", "Owner and repo are required for a GitHub scan.");
  }

  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before scanning a repository.");
  }

  return NextResponse.json(await scanRepository({ installationId, owner: body.owner, repo: body.repo }));
});
