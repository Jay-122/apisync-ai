"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

const COMMANDS = [
  { id: "scan", label: "Scan repository", hint: "Demo fixture", href: "/sandbox" },
  { id: "migrations", label: "View migrations", hint: "OpenAI SDK", href: "/migrations/mig_openai_v4" },
  { id: "sandbox", label: "Open sandbox", hint: "No GitHub required", href: "/sandbox" },
  { id: "deps", label: "Search dependencies", hint: "checkout-service", href: "/dashboard/repos/acme-checkout-service" },
  { id: "create", label: "Create migration", hint: "Run the demo pipeline", href: "/sandbox" },
  { id: "prs", label: "View Pull Requests", hint: "Simulated PR", href: "/migrations/mig_openai_v4" },
  { id: "github", label: "Connect GitHub", hint: "GitHub App", href: "/connect" },
  { id: "docs", label: "Open docs", hint: "API reference", href: "/docs" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return COMMANDS.filter((command) => command.label.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="hidden h-8 items-center gap-2 rounded-md border border-white/10 px-2 text-xs text-slate-400 hover:bg-white/[0.04] sm:inline-flex">
        <Search className="h-3.5 w-3.5" />
        Search
        <kbd className="font-mono text-[10px] text-slate-500">Ctrl K</kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          className="fixed left-1/2 top-[16%] z-50 w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 rounded-lg border border-white/10 bg-[#0D1117] shadow-2xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && results[active]) go(results[active].href);
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-white/8 px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Scan, migrate, open sandbox..."
              className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <ul className="max-h-80 overflow-auto p-1">
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-slate-500">No matching commands.</li>
            ) : (
              results.map((command, index) => (
                <li key={command.id}>
                  <button
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                      index === active ? "bg-white/[0.06] text-white" : "text-slate-300"
                    }`}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(command.href)}
                  >
                    {command.label}
                    <span className="text-xs text-slate-500">{command.hint}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
