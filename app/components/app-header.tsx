"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fuel,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/invoice", label: "Invoices", Icon: ReceiptText },
  { href: "/customers", label: "Customers", Icon: Users },
];

export function AppHeader() {
  const pathname = usePathname();

  if (["/", "/login", "/register"].includes(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080b10]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-300 text-slate-950 shadow-[0_0_22px_rgba(110,231,183,0.2)]">
            <Fuel aria-hidden="true" className="size-4" strokeWidth={2.2} />
          </span>

          <div className="leading-none">
            <span className="block text-sm font-semibold tracking-tight text-white">
              Fuel VAT Manager
            </span>
            <span className="mt-1 block text-[10px] font-medium tracking-[0.18em] text-slate-500">
              STATION NAV
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1 md:flex">
          {navItems.map(({ href, label, Icon }) => {
            const isActive =
              href === "/invoice"
                ? pathname.startsWith("/invoice")
                : pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-emerald-300 text-slate-950"
                    : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/invoice/form"
            className="hidden rounded-lg bg-emerald-300 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 sm:inline-flex"
          >
            New Invoice
          </Link>

          <form action="/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Logout
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
