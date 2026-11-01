
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Create VAT Invoices",
    description:
      "Generate professional fuel VAT invoices for petrol, diesel, or combined purchases.",
  },
  {
    number: "02",
    title: "Manage Customers",
    description:
      "Save customer information and reuse it whenever you create a new invoice.",
  },
  {
    number: "03",
    title: "Invoice History",
    description:
      "Access your previous invoices, search records, and filter them whenever needed.",
  },
  {
    number: "04",
    title: "Print & Export",
    description:
      "Generate clean, professional invoice documents ready for printing and sharing.",
  },
];

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      {/* Navigation */}
      <header className="border-b border-gray-100">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
              FV
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                Fuel VAT Manager
              </p>
              <p className="text-[10px] tracking-widest text-gray-500">
                INVOICE MANAGEMENT
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Simple fuel invoice management
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl">
              Fuel invoices.
              <br />
              <span className="text-gray-400">
                Made simpler.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-gray-600">
              Create, manage, and organize your fuel VAT invoices
              with one simple platform. Designed to make everyday
              invoicing easier for fuel stations.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-lg bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Create Your Account
                <ArrowIcon />
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-6 py-4 text-sm font-semibold transition hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              A simpler way to manage your fuel station invoices.
            </p>
          </div>

          {/* Invoice preview illustration */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-3xl bg-gray-100 blur-2xl" />

            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <div>
                  <p className="text-sm font-bold">
                    Invoice Overview
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Fuel VAT Manager
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                  Issued
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-6">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Invoice Number
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    INV-001
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Invoice Date
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    01 Nov 2026
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Customer
                  </span>
                  <span className="font-semibold">
                    ABC Company
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Product
                  </span>
                  <span className="font-semibold">
                    Petrol
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Quantity
                  </span>
                  <span className="font-semibold">
                    250 Litres
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-dashed border-gray-200" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    Invoice Total
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    Rs. 85,000.00
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M7 3h8l5 5v13H7z" />
                    <path d="M15 3v5h5M10 13h7M10 17h7" />
                  </svg>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-gray-950 px-4 py-3 text-center text-xs font-semibold text-white">
                PROFESSIONAL FUEL VAT INVOICE
              </div>
            </div>

            <div className="absolute -bottom-6 -left-5 hidden rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:block">
              <p className="text-xs text-gray-500">
                Invoice management
              </p>
              <p className="mt-1 text-sm font-bold">
                All in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              What you can do
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage invoices.
            </h2>

            <p className="mt-4 leading-7 text-gray-500">
              Spend less time organizing paperwork and more
              time managing your business.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-sm font-bold text-gray-400">
                  {feature.number}
                </p>

                <h3 className="mt-8 text-lg font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            Getting started
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Start managing invoices in three steps.
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Create an account",
              description:
                "Register and set up your fuel station details.",
            },
            {
              number: "02",
              title: "Add your customers",
              description:
                "Save customer information for easier invoice creation.",
            },
            {
              number: "03",
              title: "Create invoices",
              description:
                "Enter fuel details, generate your invoice, and print it.",
            },
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-lg font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-5 text-lg font-bold">
                {step.title}
              </h3>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-gray-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-2xl bg-black px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to simplify your invoicing?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-400">
            Get started with Fuel VAT Manager and organize
            your fuel station invoices in one place.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-3 rounded-lg bg-white px-6 py-4 text-sm font-bold text-black transition hover:bg-gray-200"
          >
            Get Started
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold">Fuel VAT Manager</p>
            <p className="mt-1 text-xs text-gray-500">
              Simplifying fuel station invoicing.
            </p>
          </div>

          <div className="flex gap-5 text-sm text-gray-500">
            <Link href="/login" className="hover:text-black">
              Login
            </Link>

            <Link href="/register" className="hover:text-black">
              Register
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Fuel VAT Manager.
          </p>
        </div>
      </footer>
    </main>
  );
}
