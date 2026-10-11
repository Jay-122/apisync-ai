import { LandingHero } from "@/components/landing/hero";
import { ProofSection } from "@/components/landing/proof";
import { WorkflowCompare } from "@/components/landing/workflow";
import { SiteHeader } from "@/components/shell/site-header";
import { TerminalLog } from "@/components/terminal/TerminalLog";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <LandingHero />

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
