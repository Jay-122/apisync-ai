"use client";

import { useState } from "react";
import { ApiExplorer } from "@/components/api-explorer/ApiExplorer";
import { SourceEditor } from "@/components/editor/SourceEditor";
import { MigrationReview } from "@/components/migration/MigrationReview";
import { MigrationTimeline } from "@/components/migration/MigrationTimeline";
import { SiteHeader } from "@/components/shell/site-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotices } from "@/components/notifications/notification-center";
import { DEMO_FILES, DEMO_REPOSITORY } from "@/lib/demo/files";
import type { MigrationResult } from "@/types";

export default function SandboxPage() {
  const { push } = useNotices();
  const [selected, setSelected] = useState(DEMO_FILES[1].path);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const file = DEMO_FILES.find((item) => item.path === selected) ?? DEMO_FILES[0];

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/migration/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo" }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error?.message ?? "The demo migration failed.");
        setResult(null);
        return;
      }
      setResult(payload as MigrationResult);
      push({
        id: payload.runId,
        tone: payload.status === "completed" ? "success" : "danger",
        title: payload.status === "completed" ? "Demo migration prepared" : "Demo migration blocked",
        body: `${payload.filesChanged} files changed at ${Math.round(payload.confidence * 100)}% confidence.`,
        href: "/migrations/mig_openai_v4",
      });
    } catch {
      setError("The demo migration request did not complete.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-3 py-4 md:px-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Dependency upgrade</p>
            <h1 className="text-lg font-semibold tracking-tight">{DEMO_REPOSITORY}</h1>
          </div>
          <StatusBadge status="neutral" label="Demo mode" />
          <div className="ml-auto">
            <Button onClick={run} disabled={running}>
              {running ? "Running migration..." : "Run migration"}
            </Button>
          </div>
        </div>
        <div className="grid min-h-[720px] overflow-hidden rounded-lg border border-white/8 lg:grid-cols-[340px_minmax(0,1fr)]">
          <ApiExplorer />
          <section className="flex min-h-[640px] flex-col bg-[#0D1117]">
            <div className="flex gap-1 overflow-auto border-b border-white/8 px-2 py-2">
              {DEMO_FILES.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setSelected(item.path)}
                  className={`shrink-0 rounded px-2 py-1 font-mono text-[11px] ${item.path === file.path ? "bg-white/10 text-white" : "text-slate-400"}`}
                >
                  {item.path.split("/").pop()}
                </button>
              ))}
            </div>
            <div className="min-h-[360px] flex-1">
              <SourceEditor value={file.content} language={file.language === "json" ? "json" : "typescript"} />
            </div>
          </section>
        </div>
        <section className="mt-4">
          {running ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-4">
              <p className="text-sm text-red-100">{error}</p>
              <Button className="mt-3" variant="secondary" onClick={run}>
                Retry
              </Button>
            </div>
          ) : null}
          {!running && !result && !error ? (
            <div className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-slate-400">
              The editor is showing the outdated demo source. Run the migration to generate a real diff with ts-morph. GitHub is not contacted.
            </div>
          ) : null}
          {result ? (
            <div className="space-y-4">
              <MigrationReview result={result} />
              <section className="rounded-lg border border-white/8 p-4">
                <h2 className="text-sm font-medium">Run {result.runId}</h2>
                <div className="mt-3">
                  <MigrationTimeline events={result.timeline} />
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
