import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileText,
  Fuel,
  Printer,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    number: "01",
    title: "Create VAT invoices",
    description:
      "Create polished invoices for petrol, diesel, or combined fuel purchases in just a few steps.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Keep customers close",
    description:
      "Save customer details once and bring them into your next invoice without retyping.",
    icon: UsersRound,
  },
  {
    number: "03",
    title: "Find every record",
    description:
      "Keep your invoice history together and quickly find the records your business needs.",
    icon: Clock3,
  },
  {
    number: "04",
    title: "Ready to share",
    description:
      "Print clean, professional documents that are ready to hand over or share.",
    icon: Printer,
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your station",
    description: "Create an account and add your fuel station details.",
  },
  {
    number: "02",
    title: "Add your customers",
    description: "Save customer information for faster invoice creation.",
  },
  {
    number: "03",
    title: "Create and share",
    description: "Add fuel details, generate an invoice, and print it.",
  },
];

function BrandMark() {
  return (
    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-300 text-slate-950 shadow-[0_0_24px_rgba(110,231,183,0.2)]">
      <Fuel aria-hidden="true" className="size-5" strokeWidth={2.2} />
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080b10] text-slate-100 selection:bg-emerald-300/30">
      <header className="relative z-10 border-b border-white/[0.07]">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"
        >
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <span>
              <span className="block text-sm font-semibold tracking-tight text-white">
                Fuel VAT Manager
              </span>
              <span className="mt-0.5 block text-[10px] font-medium tracking-[0.18em] text-slate-500">
                INVOICE MANAGEMENT
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
            >
              Get started
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-56 left-1/2 -z-10 h-[34rem] w-[56rem] -translate-x-1/2 rounded-full bg-emerald-400/[0.08] blur-[120px]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1fr_0.92fr] lg:gap-20 lg:pb-32 lg:pt-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3.5 py-2 text-xs font-medium text-emerald-200">
              <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
              Built for fuel station teams
            </div>

            <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Better fuel
              <br />
              invoices,{" "}
              <span className="text-emerald-300">less busywork.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Create, organize, and share fuel VAT invoices from one calm,
              straightforward workspace. Spend less time on paperwork and more
              time running your station.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-3 rounded-xl bg-emerald-300 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_8px_30px_rgba(110,231,183,0.15)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Create your account
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-2 text-sm text-slate-500">
              <BadgeCheck
                aria-hidden="true"
                className="size-4 text-emerald-300"
              />
              A clearer way to manage everyday fuel invoicing
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-[2rem] bg-emerald-300/[0.06] blur-3xl"
            />
            <div className="relative rounded-2xl border border-white/10 bg-[#11161e] p-4 shadow-[0_32px_100px_rgba(0,0,0,0.55)] sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-300">
                    <FileText aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Invoice preview
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Fuel VAT Manager
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  Issued
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-xs text-slate-500">Invoice number</p>
                  <p className="mt-2 font-mono text-sm font-medium text-slate-100">
                    INV-001
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-xs text-slate-500">Invoice date</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">
                    01 Nov 2026
                  </p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-white/[0.07]">
                {[
                  ["Customer", "ABC Company"],
                  ["Product", "Petrol"],
                  ["Quantity", "250 litres"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3.5 text-sm"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-200">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-end justify-between rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
                <div>
                  <p className="text-xs text-slate-400">Invoice total</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Rs. 85,000.00
                  </p>
                </div>
                <span className="mb-1 rounded-md bg-emerald-300/10 px-2 py-1 font-mono text-[10px] tracking-wide text-emerald-200">
                  VAT INVOICE
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#0b0f15] px-4 py-3">
                <span className="text-xs text-slate-500">
                  Professional, print-ready documents
                </span>
                <Printer
                  aria-hidden="true"
                  className="size-4 text-slate-400"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-xl border border-white/10 bg-[#151b24] px-4 py-3 shadow-xl sm:flex">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-300">
                <Clock3 aria-hidden="true" className="size-4" />
              </span>
              <span>
                <span className="block text-xs text-slate-500">
                  Your records
                </span>
                <span className="mt-0.5 block text-sm font-medium text-white">
                  All in one place
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Everything in its place
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                The essentials, without the extra steps.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-400">
              One simple workflow for the everyday work of fuel station
              invoicing—from customer details to a document ready to print.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ number, title, description, icon: Icon }) => (
              <article
                key={number}
                className="group rounded-2xl border border-white/[0.08] bg-[#0e1219] p-5 transition duration-200 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-[#111821] sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-emerald-300/10 bg-emerald-300/[0.07] text-emerald-300 transition group-hover:border-emerald-300/20 group-hover:bg-emerald-300/10">
                    <Icon aria-hidden="true" className="size-[18px]" />
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    {number}
                  </span>
                </div>
                <h3 className="mt-8 text-base font-semibold text-slate-100">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Up and running
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              From setup to sent in three simple steps.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              A practical workflow that keeps your fuel station invoicing
              moving, without adding complexity to your day.
            </p>
            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              Start with an account
              <ArrowDownRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-[#0e1219] px-5 sm:px-7">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-5 py-6 sm:gap-7 sm:py-7"
              >
                <span className="pt-0.5 font-mono text-sm text-emerald-300">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-emerald-200/15 bg-[#111a1b] px-6 py-14 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(110,231,183,0.12),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              A better way to keep track
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Make your next invoice the easy one.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Bring your station’s customer details and fuel invoices together
              in one straightforward workspace.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
            >
              Get started
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <span>
              <span className="block text-sm font-semibold text-white">
                Fuel VAT Manager
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Simplifying fuel station invoicing.
              </span>
            </span>
          </Link>
          <div className="flex gap-5 text-sm text-slate-400">
            <Link href="/login" className="transition hover:text-white">
              Sign in
            </Link>
            <Link href="/register" className="transition hover:text-white">
              Register
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Fuel VAT Manager.
          </p>
        </div>
      </footer>
    </main>
  );
}
