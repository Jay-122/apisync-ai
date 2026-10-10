import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { DependencyStatus } from "@/types";

export type DependencyRow = {
  name: string;
  version: string;
  status: DependencyStatus;
  risk: "Low" | "Medium" | "High";
  href?: string;
};

export function DependencyTable({ rows }: { rows: DependencyRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-sm text-slate-400">
        No supported dependencies were found in the indexed files.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/8">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/[0.03] text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">Dependency</th>
            <th className="px-3 py-2 font-medium">Version</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-white/8 hover:bg-white/[0.03]">
              <td className="px-3 py-3 text-slate-100">
                {row.href ? (
                  <Link href={row.href} className="hover:text-cyan-200">
                    {row.name}
                  </Link>
                ) : (
                  row.name
                )}
              </td>
              <td className="px-3 py-3 font-mono text-xs text-slate-400">{row.version}</td>
              <td className="px-3 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-3 py-3 text-slate-300">{row.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
