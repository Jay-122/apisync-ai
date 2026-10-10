import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold">This page is not in the workspace.</h1>
      <p className="mt-2 text-sm text-slate-400">The demo migration id is mig_openai_v4. Other ids are not fabricated.</p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm text-cyan-300">
        Back to overview
      </Link>
    </main>
  );
}
