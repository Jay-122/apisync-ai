"use client";

import type { TimelineEvent } from "@/types";

const labels: Record<TimelineEvent["name"], string> = {
  started: "Started",
  dependency_detected: "Dependency detected",
  changelog_parsed: "Changelog parsed",
  files_scanned: "Files scanned",
  transformations_generated: "Transformations generated",
  validation_started: "Validation started",
  validation_completed: "Validation completed",
  pr_created: "Pull request prepared",
  pr_blocked: "Pull request blocked",
};

export function MigrationTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No run events were recorded.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={`${event.name}-${event.at}`} className="grid grid-cols-[12px_1fr] gap-3">
          <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
          <div>
            <p className="text-sm text-slate-100">{labels[event.name]}</p>
            <p className="text-xs text-slate-500">
              {event.detail} · <span className="font-mono">{event.at.slice(11, 19)}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
