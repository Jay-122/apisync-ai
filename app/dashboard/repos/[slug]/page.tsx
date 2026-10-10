import Link from "next/link";
import { notFound } from "next/navigation";
import { DependencyTable, type DependencyRow } from "@/components/dashboard/DependencyTable";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { StatusBadge } from "@/components/status-badge";
import { scanDemo } from "@/lib/migration/service";
import type { DependencyStatus } from "@/types";

export const dynamic = "force-dynamic";

const samples = [
  { slug: "northwind-billing", name: "northwind/billing", note: "Sample card. This repository was not scanned." },
  { slug: "lumen-notify", name: "lumen/notify", note: "Sample card. This repository was not scanned." },
];

function classify(packageName: string, version: string): { status: DependencyStatus; risk: DependencyRow["risk"] } {
  if (packageName === "openai" && version.includes("3")) return { status: "breaking", risk: "High" };
  if (packageName === "twilio") return { status: "warning", risk: "Medium" };
  return { status: "healthy", risk: "Low" };
}

export default async function RepositoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = samples.find((item) => item.slug === slug);

  if (sample) {
    return (
      <main>
        <StatusBadge status="sample" label="Sample data" />
        <h1 className="mt-3 text-2xl font-semibold">{sample.name}</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">{sample.note} Connect GitHub to replace this card with a real scan.</p>
        <Link href="/connect" className="mt-4 inline-block text-sm text-cyan-300">
          Connect GitHub
        </Link>
      </main>
    );
  }

  if (slug !== "acme-checkout-service") notFound();

  const scan = await scanDemo();
  const rows: DependencyRow[] = scan.dependencies.map((dependency) => {
    const classified = classify(dependency.packageName, dependency.version);
    return {
      name: dependency.packageName,
      version: dependency.version,
      status: classified.status,
      risk: classified.risk,
      href: dependency.packageName === "openai" ? "/migrations/mig_openai_v4" : undefined,
    };
  });
  const score = Math.max(0, 100 - rows.filter((row) => row.status === "breaking").length * 18 - rows.filter((row) => row.status === "warning").length * 6);

  return (
    <main>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{scan.repository}</h1>
        <StatusBadge status="neutral" label="Demo fixture" />
      </div>
      <p className="mt-2 text-sm text-slate-400">Health uses the indexed demo fixture. Security scanning is not part of this score.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <section className="rounded-lg border border-white/8 p-4">
          <HealthScore score={score} caption="Calculated from breaking and deprecated dependencies in the fixture." />
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <dt>Dependencies</dt>
              <dd>{score}</dd>
            </div>
            <div className="flex justify-between text-slate-300">
              <dt>Security</dt>
              <dd className="text-slate-500">Not assessed</dd>
            </div>
            <div className="flex justify-between text-slate-300">
              <dt>API compatibility</dt>
              <dd>{rows.some((row) => row.status === "breaking") ? "Breaking" : "Stable"}</dd>
            </div>
            <div className="flex justify-between text-slate-300">
              <dt>Migration risk</dt>
              <dd>{rows.some((row) => row.risk === "High") ? "High" : "Low"}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium">Dependency health</h2>
          <DependencyTable rows={rows} />
        </section>
      </div>
    </main>
  );
}
