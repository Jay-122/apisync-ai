"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const LINES = [
  { text: "$ apisync scan", tone: "command" },
  { text: "✓ Repository connected", tone: "ok" },
  { text: "✓ package.json analyzed", tone: "ok" },
  { text: "✓ 6 dependencies indexed in the demo fixture", tone: "ok" },
  { text: "⚠ OpenAI SDK migration detected", tone: "warn" },
  { text: "Searching codebase...", tone: "muted" },
  { text: "src/lib/openai.ts", tone: "muted" },
  { text: "src/services/chat.ts", tone: "muted" },
  { text: "src/api/generate.ts", tone: "muted" },
  { text: "Generating migration plan...", tone: "muted" },
  { text: "✓ AST transformation generated", tone: "ok" },
  { text: "✓ TypeScript validation passed", tone: "ok" },
  { text: "✓ Contract checks passed", tone: "ok" },
  { text: "Opening pull request preview...", tone: "muted" },
  { text: "Simulated PR #184 prepared", tone: "ok" },
];

export function TerminalLog() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? LINES.length : 1);

  useEffect(() => {
    if (reduce || count >= LINES.length) return;
    const timer = window.setTimeout(() => setCount((value) => value + 1), 280);
    return () => window.clearTimeout(timer);
  }, [count, reduce]);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#07090d]">
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Example session</p>
      </div>
      <pre className="terminal-scroll h-80 overflow-auto p-4 font-mono text-[12px] leading-6 text-slate-300">
        {LINES.slice(0, count).map((line) => (
          <div
            key={line.text}
            className={
              line.tone === "ok" ? "text-emerald-300" : line.tone === "warn" ? "text-amber-300" : line.tone === "command" ? "text-slate-100" : "text-slate-400"
            }
          >
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
}
