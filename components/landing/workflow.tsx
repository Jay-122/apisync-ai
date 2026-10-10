"use client";

import { motion, useReducedMotion } from "framer-motion";

const traditional = [
  "Read changelog",
  "Search repository",
  "Understand migration",
  "Rewrite code",
  "Run tests",
  "Debug failures",
  "Create PR",
];

const apisync = ["Detect", "Analyze", "Transform", "Validate", "PR"];

export function WorkflowCompare() {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-white/8 bg-white/[0.02] p-5">
        <h3 className="text-sm font-medium text-slate-200">Traditional workflow</h3>
        <ol className="mt-4 space-y-2">
          {traditional.map((step, index) => (
            <motion.li
              key={step}
              initial={reduce ? false : { opacity: 0.4 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-3 text-sm text-slate-400"
            >
              <span className="font-mono text-[11px] text-slate-600">{String(index + 1).padStart(2, "0")}</span>
              {step}
            </motion.li>
          ))}
        </ol>
      </article>
      <article className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.04] p-5">
        <h3 className="text-sm font-medium text-cyan-100">ApiSync</h3>
        <ol className="mt-4 space-y-2">
          {apisync.map((step, index) => (
            <motion.li
              key={step}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="flex items-center gap-3 text-sm text-slate-100"
            >
              <span className="font-mono text-[11px] text-cyan-300/80">{String(index + 1).padStart(2, "0")}</span>
              {step}
            </motion.li>
          ))}
        </ol>
        <p className="mt-5 text-xs leading-5 text-slate-400">
          The same work, compressed into a proposal you can review. Nothing merges itself.
        </p>
      </article>
    </div>
  );
}
