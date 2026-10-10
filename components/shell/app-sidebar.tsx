"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { CommandPalette } from "@/components/shell/command-palette";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/repos/acme-checkout-service", label: "Repositories" },
  { href: "/migrations/mig_openai_v4", label: "Migrations" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/docs", label: "Docs" },
  { href: "/connect", label: "GitHub" },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/8 bg-[#080A0F] md:flex">
        <div className="flex h-14 items-center px-4">
          <Logo compact />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-1.5 text-[13px] ${active ? "bg-white/[0.06] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3 md:hidden">
        <Logo compact />
      </div>
      <div className="flex gap-2 overflow-auto border-b border-white/8 px-3 py-2 md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-300">
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}

export function AppTopbar() {
  return (
    <div className="flex h-14 items-center justify-end gap-2 border-b border-white/8 px-4 md:px-6">
      <CommandPalette />
      <NotificationCenter />
    </div>
  );
}
