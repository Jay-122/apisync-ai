"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useMemo, useState } from "react";

export type Notice = {
  id: string;
  tone: "warning" | "success" | "danger" | "info";
  title: string;
  body: string;
  href?: string;
  sample?: boolean;
};

const seed: Notice[] = [
  {
    id: "openai",
    tone: "warning",
    title: "OpenAI migration detected",
    body: "Demo fixture acme/checkout-service has a vetted v3 to v4 rule.",
    href: "/migrations/mig_openai_v4",
  },
  {
    id: "stripe",
    tone: "success",
    title: "Stripe migration completed",
    body: "Sample signal only. Stripe usage in the demo was left unchanged.",
    sample: true,
  },
  {
    id: "twilio",
    tone: "danger",
    title: "Twilio migration validation failed",
    body: "Sample signal only. No Twilio rewrite is registered.",
    sample: true,
  },
  {
    id: "pr",
    tone: "info",
    title: "PR #184 ready for review",
    body: "Opens the simulated demo pull request.",
    href: "/migrations/mig_openai_v4",
    sample: true,
  },
];

const NoticeContext = createContext<{ notices: Notice[]; push: (notice: Notice) => void }>({
  notices: seed,
  push: () => undefined,
});

export function useNotices() {
  return useContext(NoticeContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState(seed);
  const value = useMemo(
    () => ({
      notices,
      push: (notice: Notice) => setNotices((current) => [notice, ...current].slice(0, 12)),
    }),
    [notices],
  );
  return <NoticeContext.Provider value={value}>{children}</NoticeContext.Provider>;
}

const dot = {
  warning: "bg-amber-300",
  success: "bg-emerald-300",
  danger: "bg-red-300",
  info: "bg-cyan-300",
};

export function NotificationCenter() {
  const { notices } = useNotices();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="grid h-8 w-8 place-items-center rounded-md text-slate-300 hover:bg-white/[0.05]"
        aria-label="Open notifications"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 z-50 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-white/10 bg-[#0D1117] p-2 shadow-2xl"
          >
            <p className="px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">Signals</p>
            <ul className="mt-1 space-y-1">
              {notices.map((notice) => {
                const row = (
                  <span className="flex gap-2">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dot[notice.tone]}`} />
                    <span>
                      <span className="block text-sm text-slate-100">{notice.title}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-400">{notice.body}</span>
                      {notice.sample ? <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-500">Sample</span> : null}
                    </span>
                  </span>
                );
                return (
                  <li key={notice.id}>
                    {notice.href ? (
                      <Link href={notice.href} className="block rounded-md px-2 py-2 hover:bg-white/[0.04]" onClick={() => setOpen(false)}>
                        {row}
                      </Link>
                    ) : (
                      <div className="rounded-md px-2 py-2">{row}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
