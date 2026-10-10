import { cn } from "@/lib/utils";
import type { DependencyStatus } from "@/types";

const tones: Record<DependencyStatus | "neutral" | "sample", string> = {
  healthy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  breaking: "border-red-400/25 bg-red-400/10 text-red-300",
  fixing: "border-indigo-400/25 bg-indigo-400/10 text-indigo-300",
  fixed: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  neutral: "border-white/10 bg-white/[0.04] text-slate-300",
  sample: "border-white/10 bg-white/[0.04] text-slate-400",
};

const labels: Record<DependencyStatus | "neutral" | "sample", string> = {
  healthy: "Healthy",
  warning: "Deprecated",
  breaking: "Breaking change",
  fixing: "Fixing",
  fixed: "Fixed",
  neutral: "Neutral",
  sample: "Sample",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: DependencyStatus | "neutral" | "sample";
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[status],
        className,
      )}
    >
      {label ?? labels[status]}
    </span>
  );
}
