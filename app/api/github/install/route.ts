import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { githubConfig } from "@/lib/github/config";
import { INSTALLATION_COOKIE } from "@/lib/github/session";
import { withApi } from "@/lib/api/http";

export const GET = withApi("/api/github/install", async (request) => {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const config = githubConfig();

  if (installationId && Number.isInteger(Number(installationId)) && Number(installationId) > 0) {
    const jar = await cookies();
    jar.set(INSTALLATION_COOKIE, installationId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return NextResponse.redirect(new URL("/connect?status=connected", url));
  }

  if (!config.configured || !config.slug) {
    return NextResponse.redirect(new URL("/connect?status=unconfigured", url));
  }

  return NextResponse.redirect(`https://github.com/apps/${config.slug}/installations/new`);
});
