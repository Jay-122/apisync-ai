import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubConfig } from "@/lib/github/config";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { withApi } from "@/lib/api/http";

export const GET = withApi("/api/github/status", async () => {
  const config = githubConfig();
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  return NextResponse.json({
    configured: config.configured,
    webhookConfigured: Boolean(config.webhookSecret),
    installationConnected: Boolean(installationId),
  });
});
