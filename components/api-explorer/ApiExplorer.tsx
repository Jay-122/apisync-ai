"use client";

import { useState } from "react";
import { OPENAPI_OPERATIONS } from "@/lib/demo/files";

const methodTone = {
  GET: "text-emerald-300",
  POST: "text-indigo-300",
};

export function ApiExplorer() {
  const [selected, setSelected] = useState(OPENAPI_OPERATIONS[0].path);
  const [breaking, setBreaking] = useState(false);
  const operation = OPENAPI_OPERATIONS.find((item) => item.path === selected) ?? OPENAPI_OPERATIONS[0];

  return (
    <section className="flex h-full flex-col border-white/8 bg-[#0B0E14] lg:border-r">
      <header className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">API Explorer</p>
          <h2 className="text-sm font-medium text-white">OpenAI HTTP surface</h2>
        </div>
        <button
          className={`rounded-md border px-2 py-1 text-[11px] ${breaking ? "border-red-400/30 text-red-200" : "border-white/10 text-slate-300"}`}
          onClick={() => setBreaking((value) => !value)}
        >
          {breaking ? "Breaking upgrade" : "Current API"}
        </button>
      </header>
      <ul className="border-b border-white/8">
        {OPENAPI_OPERATIONS.map((item) => (
          <li key={item.path}>
            <button
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] hover:bg-white/[0.03] ${
                item.path === operation.path ? "bg-white/[0.04]" : ""
              }`}
              onClick={() => setSelected(item.path)}
            >
              <span className={`w-12 font-mono text-[11px] ${methodTone[item.method]}`}>{item.method}</span>
              <span className="font-mono text-slate-200">{item.path}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-white">{operation.summary}</h3>
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{breaking ? "SDK v4" : "SDK v3"}</span>
        </div>
        <pre className="overflow-auto rounded-md border border-white/8 bg-black/30 p-3 font-mono text-[12px] leading-5 text-slate-200">
          {breaking ? operation.v2 : operation.v1}
        </pre>
        <p className="text-xs leading-5 text-slate-400">{operation.note}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-white/8 p-2">
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-1 text-slate-200">{operation.status}</dd>
          </div>
          <div className="rounded-md border border-white/8 p-2">
            <dt className="text-slate-500">Rewrite</dt>
            <dd className="mt-1 text-slate-200">{operation.status === "stable" ? "Not automatic" : "Catalog rule"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
