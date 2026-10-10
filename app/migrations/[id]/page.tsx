import { notFound } from "next/navigation";
import { MigrationReview } from "@/components/migration/MigrationReview";
import { MigrationTimeline } from "@/components/migration/MigrationTimeline";
import { SiteHeader } from "@/components/shell/site-header";
import { StatusBadge } from "@/components/status-badge";
import { DEMO_MIGRATION_ID } from "@/lib/demo/files";
import { runDemoMigration } from "@/lib/migration/service";

export const dynamic = "force-dynamic";

export default async function MigrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== DEMO_MIGRATION_ID) notFound();
  const result = await runDemoMigration();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Breaking change detected</p>
          <StatusBadge status="neutral" label="Demo mode" />
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">OpenAI SDK {result.fromVersion} → {result.toVersion}</h1>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Dependency", result.dependency],
            ["Current version", result.fromVersion],
            ["Target version", result.toVersion],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/8 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</dt>
              <dd className="mt-1 text-sm text-white">{value}</dd>
            </div>
          ))}
        </dl>
        <section className="mt-6 rounded-lg border border-white/8 p-4">
          <h2 className="text-sm font-medium">Pipeline</h2>
          <div className="mt-4">
            <MigrationTimeline events={result.timeline} />
          </div>
        </section>
        <div className="mt-6">
          <MigrationReview result={result} />
        </div>
        <section className="mt-6 rounded-lg border border-white/8 p-4">
          <h2 className="text-sm font-medium">Pull request body</h2>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-xs leading-5 text-slate-300">{result.pullRequest.body}</pre>
        </section>
      </main>
    </>
  );
}
