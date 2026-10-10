import Link from "next/link";
import { InstallationRepos } from "@/components/github/installation-repos";
import { SiteHeader } from "@/components/shell/site-header";
import { Button } from "@/components/ui/button";
import { githubConfig } from "@/lib/github/config";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { cookies } from "next/headers";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const config = githubConfig();
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  const unconfigured = !config.configured || !config.slug;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">GitHub</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Connect GitHub</h1>
        {unconfigured ? (
          <div className="mt-6 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] p-4">
            <p className="text-sm font-medium text-amber-100">GitHub connection unavailable — running Demo Repository.</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The server does not have a GitHub App slug and private key. No repository was scanned and no pull request was opened.
            </p>
            <Button asChild className="mt-4">
              <Link href="/sandbox">Try Demo Repository</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
            <p>{installationId ? `Installation ${installationId} is stored in an httpOnly cookie.` : "Install the GitHub App, then return here to choose a repository."}</p>
            <ol className="list-decimal space-y-1 pl-5 text-slate-400">
              <li>Connect GitHub</li>
              <li>Choose repository</li>
              <li>Scan repository</li>
              <li>Show dependency graph</li>
              <li>Detect potential migration</li>
            </ol>
            <Button asChild>
              <Link href="/api/github/install">{installationId ? "Reconnect GitHub" : "Install GitHub App"}</Link>
            </Button>
            {installationId ? <InstallationRepos /> : null}
            {params.status === "connected" ? <p className="text-emerald-300">Installation id captured. Click Choose repository, then Scan.</p> : null}
          </div>
        )}
      </main>
    </>
  );
}
