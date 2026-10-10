import Link from "next/link";
import { DependencyGraphCanvas } from "@/components/3d/DependencyGraphCanvas";
import { ProofSection } from "@/components/landing/proof";
import { WorkflowCompare } from "@/components/landing/workflow";
import { SiteHeader } from "@/components/shell/site-header";
import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-white/8">
          <div className="mx-auto grid max-w-6xl min-h-[min(100svh,900px)] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 flex flex-col justify-end bg-[#080A0F] px-4 pb-12 pt-28 md:px-6 lg:pb-16 lg:pr-10">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Dependency migration infrastructure</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.08]">
                Your dependencies changed. Your code doesn&apos;t have to break.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 md:text-base">
                ApiSync AI detects breaking API changes, rewrites affected code with an AST, validates the migration, and opens a
                review-ready pull request. Main is never modified automatically.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/connect">Connect GitHub</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/sandbox">Try Interactive Demo</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden min-h-[420px] overflow-hidden border-l border-white/8 bg-[#06080c] lg:block">
              <div className="grid-mask pointer-events-none absolute inset-0 opacity-60" />
              <DependencyGraphCanvas showLabels={false} />
            </div>
          </div>
          <div className="h-56 border-t border-white/8 bg-[#06080c] lg:hidden">
            <DependencyGraphCanvas showLabels={false} />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Live terminal</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">A scan you can read.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The animation below is an example session. The sandbox runs the same pipeline against a real AST, not a screenshot.
            </p>
          </div>
          <TerminalLog />
        </section>

        <section id="trust" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-8 md:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Trust</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">What you see before you merge.</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["What changed", "A diff for every file the rule actually rewrote."],
              ["Why it changed", "The catalog rule, the old call, and the replacement."],
              ["What happens next", "Validation first. A pull request only if it passes. Never a merge."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-lg border border-white/8 bg-white/[0.02] p-4">
                <h3 className="text-sm font-medium text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <ProofSection />

        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Workflow</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">From changelog to review.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            ApiSync keeps the human decision at the end. Detect, explain, preview, validate, then propose a pull request.
          </p>
          <div className="mt-8">
            <WorkflowCompare />
          </div>
        </section>
      </main>
    </>
  );
}
