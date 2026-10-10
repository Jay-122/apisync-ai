"use client";

import { useState } from "react";
import { DiffEditor } from "@/components/editor/DiffEditor";
import { StatusBadge } from "@/components/status-badge";
import { confidenceLabel, formatPercent } from "@/lib/utils";
import type { MigrationResult } from "@/types";

export function MigrationReview({ result }: { result: MigrationResult }) {
  const changed = result.files.filter((file) => file.changed);
  const skipped = result.files.filter((file) => file.skipped);
  const [path, setPath] = useState(changed[0]?.path ?? result.files[0]?.path);
  const file = result.files.find((item) => item.path === path) ?? result.files[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-lg border border-white/8 bg-[#0D1117]">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/8 px-3 py-2">
          {result.files.map((item) => (
            <button
              key={item.path}
              onClick={() => setPath(item.path)}
              className={`rounded px-2 py-1 font-mono text-[11px] ${item.path === file?.path ? "bg-white/10 text-white" : "text-slate-400"}`}
            >
              {item.path.split("/").pop()}
            </button>
          ))}
          <span className="ml-auto font-mono text-[11px] text-slate-400">
            {result.filesChanged} files changed +{result.additions} -{result.deletions}
          </span>
        </div>
        <div className="h-[420px]">
          {file ? (
            <DiffEditor
              original={file.original}
              modified={file.modified}
              language={file.path.endsWith(".json") ? "json" : "typescript"}
            />
          ) : null}
        </div>
      </section>
      <aside className="space-y-3">
        <section className="rounded-lg border border-white/8 bg-[#0D1117] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Why this changed</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{result.explanation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={result.confidence >= 0.95 ? "fixed" : "warning"} label={confidenceLabel(result.confidence)} />
            <span className="font-mono text-xs text-slate-400">{formatPercent(result.confidence)}</span>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-slate-400">
            {result.analysis.breakingChanges.map((change) => (
              <li key={change.oldPattern}>
                {change.oldPattern} → {change.newPattern}
                {change.paramRenames
                  ? ` · ${Object.entries(change.paramRenames)
                      .map(([from, to]) => `${from} → ${to}`)
                      .join(", ")}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-white/8 bg-[#0D1117] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Validation</p>
          <ul className="mt-3 space-y-2">
            {result.validation.checks.map((check) => (
              <li key={check.id} className="text-sm text-slate-200">
                <span className={check.status === "failed" ? "text-red-300" : check.status === "skipped" ? "text-slate-400" : "text-emerald-300"}>
                  {check.status === "failed" ? "✕" : check.status === "skipped" ? "–" : "✓"} {check.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">{check.detail}</span>
              </li>
            ))}
          </ul>
        </section>
        {skipped.length ? (
          <section className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-amber-200/80">Left untouched</p>
            <ul className="mt-2 space-y-2 text-xs text-slate-300">
              {skipped.map((item) => (
                <li key={item.path}>
                  <span className="font-mono">{item.path}</span>
                  <span className="mt-0.5 block text-slate-400">{item.skipReason}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="rounded-lg border border-white/8 bg-[#0D1117] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white">{result.pullRequest.title}</p>
            {result.pullRequest.simulated ? <StatusBadge status="neutral" label="Demo mode" /> : null}
          </div>
          <p className="mt-2 font-mono text-[11px] text-slate-500">
            {result.pullRequest.branch} → {result.pullRequest.base}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {result.pullRequest.status === "blocked"
              ? "Pull request creation is blocked."
              : result.pullRequest.simulated
                ? `Simulated PR ${result.pullRequest.number ?? ""} prepared. GitHub was not contacted.`
                : result.pullRequest.url
                  ? "Pull request opened. It is not merged."
                  : "Proposal is ready. Opening it still requires GitHub."}
          </p>
          {result.pullRequest.url ? (
            <a className="mt-3 inline-block text-xs text-cyan-300" href={result.pullRequest.url}>
              Open on GitHub
            </a>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
