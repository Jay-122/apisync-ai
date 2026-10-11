import Link from "next/link";
import { DependencyGraphCanvas } from "@/components/3d/DependencyGraphCanvas";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/8 bg-[#080A0F]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(34,211,238,0.07),transparent_50%)]" />
      <div className="relative mx-auto grid max-w-[1400px] lg:grid-cols-2 lg:min-h-[calc(100svh-3.5rem)]">
        <div className="relative z-10 flex flex-col justify-center px-4 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Dependency migration infrastructure
          </p>
          <h1 className="mt-5 max-w-[18ch] text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.35rem] lg:text-[2.65rem] lg:leading-[1.1] xl:text-[2.85rem]">
            Your dependencies changed.
            <span className="mt-1 block text-slate-200">Your code doesn&apos;t have to break.</span>
          </h1>
          <p className="mt-5 max-w-md text-pretty text-[15px] leading-7 text-slate-400 sm:text-base">
            ApiSync AI detects breaking API changes, rewrites affected code with an AST, validates the migration, and opens a
            review-ready pull request. Main is never modified automatically.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild className="h-10 px-4">
              <Link href="/connect">Connect GitHub</Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 px-4">
              <Link href="/sandbox">Try interactive demo</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-slate-500">
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              AST transforms
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              PR-only workflow
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-indigo-400" />
              Live on Vercel
            </li>
          </ul>
        </div>

        <div className="relative hidden min-h-[min(52vh,520px)] border-t border-white/8 lg:block lg:min-h-0 lg:border-t-0 lg:border-l lg:border-white/8">
          <div className="grid-mask pointer-events-none absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#080A0F] to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.12),transparent_42%)]" />
          <div className="absolute inset-0">
            <DependencyGraphCanvas showLabels={false} />
          </div>
          <p className="pointer-events-none absolute bottom-4 right-4 z-10 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            Dependency graph
          </p>
        </div>
      </div>

      <div className="relative h-48 border-t border-white/8 bg-[#05070b] sm:h-56 lg:hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_55%)]" />
        <DependencyGraphCanvas showLabels={false} />
      </div>
    </section>
  );
}
