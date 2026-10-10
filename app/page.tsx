import Link from "next/link";
import { DependencyGraphCanvas } from "@/components/3d/DependencyGraphCanvas";
import { WorkflowCompare } from "@/components/landing/workflow";
import { SiteHeader } from "@/components/shell/site-header";
import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative min-h-[100svh] overflow-hidden">
          <div className="absolute inset-0">
            <DependencyGraphCanvas />
          </div>
          <div className="grid-mask pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080A0F_82%)]" />
          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 md:px-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Dependency migration infrastructure</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-[1.08]">
              Your dependencies changed. Your code doesn&apos;t have to break.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              ApiSync AI detects breaking API changes, rewrites affected code, validates the migration, and opens a review-ready Pull Request.
            </p>
            <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/connect">Connect GitHub</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/sandbox">Try Interactive Demo</Link>
              </Button>
            </div>
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

        <section id="product" className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="grid gap-3 md:grid-cols-3">
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

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">From changelog to review.</h2>
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
