import Link from "next/link";
import { cookies } from "next/headers";
import { INSTALLATION_COOKIE, readInstallationId } from "@/lib/github/session";
import { loadInstallationWorkspace, type InstallationWorkspace } from "@/lib/github/workspace";
import { scanDemo } from "@/lib/migration/service";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const scan = await scanDemo();
  const jar = await cookies();
  const installationId = readInstallationId(jar.get(INSTALLATION_COOKIE)?.value);
  let workspace: InstallationWorkspace | null = null;
  let workspaceError = false;
  if (installationId) {
    try {
      workspace = await loadInstallationWorkspace(installationId);
    } catch {
      workspaceError = true;
    }
  }

  const metrics = workspace
    ? [
        ["Repositories accessible", String(workspace.repositories.length)],
        ["ApiSync pull requests", String(workspace.pullRequests)],
        ["Merged", String(workspace.mergedPullRequests)],
      ]
    : [];

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Overview</h1>
        </div>
        <StatusBadge status="neutral" label={workspace ? "GitHub connected" : "GitHub not connected"} />
      </div>

      <section className="mt-6 rounded-lg border border-white/8 bg-white/[0.02] p-4">
        {workspace ? (
          <>
            <p className="text-xs text-slate-400">
              Counts come from the GitHub App installation in this browser. Pull requests are only those opened from an apisync/ branch.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {metrics.map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/8 bg-[#0D1117] px-3 py-3">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</dt>
                  <dd className="mt-2 font-mono text-2xl text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-4 divide-y divide-white/8 rounded-md border border-white/8">
              {workspace.repositories.map((repo) => (
                <li key={repo.fullName} className="flex items-center justify-between px-3 py-2 text-sm">
                  <a className="text-slate-100 hover:text-cyan-200" href={repo.url}>
                    {repo.fullName}
                  </a>
                  <span className="text-xs text-slate-500">{repo.private ? "private" : "public"}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>
            <p className="text-sm text-slate-300">
              {workspaceError
                ? "GitHub did not return this installation. Reconnect the app and refresh."
                : "No GitHub installation is stored in this browser, so there is no repository count to show."}
            </p>
            <Link href="/connect" className="mt-3 inline-block text-sm text-cyan-300">
              Connect GitHub
            </Link>
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Built-in fixture</h2>
          <Link href="/sandbox" className="text-xs text-cyan-300">
            Open sandbox
          </Link>
        </div>
        <article className="rounded-lg border border-white/8 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-medium">{scan.repository}</h3>
            <StatusBadge status="breaking" label="OpenAI breaking change" />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Indexed from the in-app fixture. {scan.dependencies.length} supported packages. Package manager: {scan.packageManager}.
          </p>
          <ul className="mt-4 divide-y divide-white/8 rounded-md border border-white/8">
            {scan.dependencies.map((dependency) => (
              <li key={dependency.packageName} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{dependency.packageName}</span>
                <span className="font-mono text-xs text-slate-400">
                  {dependency.version} · {dependency.usageCount} usages
                </span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard/repos/acme-checkout-service" className="mt-4 inline-block text-sm text-cyan-300">
            Repository health
          </Link>
        </article>
      </section>
    </main>
  );
}
