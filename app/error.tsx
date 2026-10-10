"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-24">
      <h1 className="text-2xl font-semibold">This view failed to load.</h1>
      <p className="mt-2 text-sm text-slate-400">The request did not finish. Your repository was not modified.</p>
      <button className="mt-4 rounded-md bg-white px-3 py-2 text-sm text-neutral-950" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
