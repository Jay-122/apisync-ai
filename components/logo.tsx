import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
      <span className="relative grid h-5 w-5 place-items-center">
        <span className="absolute h-5 w-5 rounded-full border border-cyan-300/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
      </span>
      {compact ? "ApiSync" : "ApiSync AI"}
    </Link>
  );
}
