import Link from "next/link";
import { Button } from "@/components/ui/button";

const PROOF = [
  {
    label: "AST rewrites",
    detail: "ts-morph transforms with skip when the pattern is unsafe",
  },
  {
    label: "GitHub App",
    detail: "Install, scan, branch apisync/*, open PR — never push to main",
  },
  {
    label: "Shipped demo",
    detail: "OpenAI SDK v3→v4 on a real repository with merged pull requests",
  },
];

export function ProofSection() {
  return (
    <section id="proof" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Proof of build</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">Production-style, not a mockup.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        ApiSync is a portfolio project you can run end-to-end: local sandbox, live deploy, and GitHub App integration with
        human review before merge.
      </p>
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {PROOF.map((item) => (
          <li key={item.label} className="rounded-lg border border-white/8 bg-[#0D1117] p-4">
            <p className="text-sm font-medium text-white">{item.label}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="secondary" size="sm">
          <Link href="/sandbox">Run sandbox</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/connect">Connect GitHub</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href="https://github.com/Jay-122/apisync-openai-demo" target="_blank" rel="noopener noreferrer">
            Demo repository
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a
            href="https://github.com/Jay-122/apisync-openai-demo/pulls?q=is%3Apr+is%3Amerged"
            target="_blank"
            rel="noopener noreferrer"
          >
            Merged PRs
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href="https://github.com/Jay-122/apisync-ai" target="_blank" rel="noopener noreferrer">
            Source code
          </a>
        </Button>
      </div>
      <p className="mt-4 font-mono text-[11px] text-slate-500">
        Stack: Next.js · TypeScript · ts-morph · Octokit · Vercel · Prisma-ready
      </p>
    </section>
  );
}
