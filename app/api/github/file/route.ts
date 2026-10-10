import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withApi } from "@/lib/api/http";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { readRepositoryFile } from "@/lib/github/scan";
import { ApiError } from "@/lib/security/errors";

export const GET = withApi("/api/github/file", async (request) => {
  const url = new URL(request.url);
  const owner = url.searchParams.get("owner") ?? "";
  const repo = url.searchParams.get("repo") ?? "";
  const path = url.searchParams.get("path") ?? "";
  if (!owner || !repo || !path) {
    throw new ApiError(400, "invalid_input", "Owner, repo, and path are required.");
  }

  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  if (!installationId) {
    throw new ApiError(401, "github_auth_required", "Connect the GitHub App before reading a file.");
  }

  const content = await readRepositoryFile({ installationId, owner, repo, path });
  return NextResponse.json({ owner, repo, path, content, simulated: false });
});
