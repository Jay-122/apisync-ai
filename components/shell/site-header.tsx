"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { CommandPalette } from "@/components/shell/command-palette";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/sandbox", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#proof", label: "Proof" },
  { href: "/docs", label: "Docs" },
  { href: "/connect", label: "GitHub" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#080A0F]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 md:gap-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 text-[13px] text-slate-400 lg:flex lg:gap-0.5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden sm:block">
            <CommandPalette />
          </div>
          <NotificationCenter />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/connect">Connect GitHub</Link>
          </Button>
          <button className="grid h-8 w-8 place-items-center rounded-md text-slate-300 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-white/8 px-4 py-3 lg:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-sm text-slate-300" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/connect"
            className="mt-2 block rounded-md bg-white px-3 py-2 text-center text-sm font-medium text-neutral-950"
            onClick={() => setOpen(false)}
          >
            Connect GitHub
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
