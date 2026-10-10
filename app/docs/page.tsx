import Link from "next/link";
import { SiteHeader } from "@/components/shell/site-header";
import { Button } from "@/components/ui/button";

const endpoints = [
  {
    method: "POST",
    path: "/api/scan",
    body: `{ "mode": "demo" }`,
    detail: "Indexes the demo fixture, or a connected repository when mode is github.",
  },
  {
    method: "POST",
    path: "/api/migration/analyze",
    body: `{ "packageName": "openai", "releaseNotes": "..." }`,
    detail: "Returns a Zod-validated changelog analysis. Catalog rules are used when no model key is configured.",
  },
  {
    method: "POST",
    path: "/api/migration/transform",
    body: `{}`,
    detail: "Runs the demo AST rewrite and returns the file diffs.",
  },
  {
    method: "POST",
    path: "/api/validation/run",
    body: `{}`,
    detail: "Re-runs the demo migration and returns validation status. Repository scripts are not executed.",
  },
  {
    method: "POST",
    path: "/api/github/create-pr",
    body: `{ "owner": "acme", "repo": "checkout-service" }`,
    detail: "Requires a configured GitHub App and installation cookie. Refuses to push to the default branch.",
  },
];

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Reference</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">ApiSync API</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Transformations are produced by the AST engine. Model output is accepted only after Zod validation, and it never becomes a code patch by itself.
        </p>
        <div id="github-app" className="mt-8 rounded-lg border border-white/8 p-4">
          <h2 className="text-sm font-medium">GitHub App</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Set GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_WEBHOOK_SECRET, and GITHUB_APP_SLUG on the server. The install route redirects to GitHub only when the slug is configured. Otherwise it sends you to the demo.
          </p>
          <pre className="mt-3 overflow-auto rounded-md bg-black/30 p-3 font-mono text-[12px] leading-5 text-slate-300">{`{
  "migrationId": "mig_openai_v4",
  "status": "completed",
  "dependency": "openai",
  "filesChanged": 4,
  "confidence": 0.96,
  "validation": { "typescript": "passed", "tests": "passed" },
  "pullRequest": { "number": 184, "status": "open", "simulated": true }
}`}</pre>
        </div>
        <div className="mt-6 space-y-3">
          {endpoints.map((endpoint) => (
            <article key={endpoint.path} className="rounded-lg border border-white/8 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-indigo-300">{endpoint.method}</span>
                <code className="font-mono text-sm text-white">{endpoint.path}</code>
              </div>
              <p className="mt-2 text-sm text-slate-400">{endpoint.detail}</p>
              <pre className="mt-3 overflow-auto rounded-md bg-black/30 p-3 font-mono text-[12px] text-slate-300">{endpoint.body}</pre>
              {endpoint.path === "/api/scan" ? (
                <Button asChild className="mt-3" variant="secondary" size="sm">
                  <Link href="/sandbox">Try it in the sandbox</Link>
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
