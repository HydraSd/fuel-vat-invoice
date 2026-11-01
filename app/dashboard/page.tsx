import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getColomboDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;

  return { year: Number(year), month: Number(month) };
}

function getMonthRange() {
  const { year, month } = getColomboDate();

  const start = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonthDate = new Date(Date.UTC(year, month, 1));
  const nextYear = nextMonthDate.getUTCFullYear();
  const nextMonth = String(nextMonthDate.getUTCMonth() + 1).padStart(2, "0");

  const end = `${nextYear}-${nextMonth}-01`;

  return { start, end };
}

function formatLKR(value: number) {
  return `Rs. ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Colombo",
    }
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get station information
  const { data: station, error: stationError } = await supabase
    .from("fuel_stations")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (stationError) {
    console.error("Station loading error:", stationError);
    throw new Error("Unable to load station information.");
  }

  if (!station) {
    redirect("/register-station");
  }

  const { start, end } = getMonthRange();

  // Fetch dashboard information
  const [
    invoiceCountResult,
    customerCountResult,
    monthlyInvoicesResult,
    recentInvoicesResult,
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("station_id", station.id),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("station_id", station.id),

    supabase
      .from("invoices")
      .select("grand_total")
      .eq("station_id", station.id)
      .gte("invoice_date", start)
      .lt("invoice_date", end)
      .neq("status", "void"),

    supabase
      .from("invoices")
      .select(
        "id, invoice_number, invoice_date, buyer_name, grand_total, status"
      )
      .eq("station_id", station.id)
      .order("invoice_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (invoiceCountResult.error) {
    console.error(invoiceCountResult.error);
    throw new Error("Unable to load invoice count.");
  }

  if (customerCountResult.error) {
    console.error(customerCountResult.error);
    throw new Error("Unable to load customer count.");
  }

  if (monthlyInvoicesResult.error) {
    console.error(monthlyInvoicesResult.error);
    throw new Error("Unable to load monthly sales.");
  }

  if (recentInvoicesResult.error) {
    console.error(recentInvoicesResult.error);
    throw new Error("Unable to load recent invoices.");
  }

  const totalInvoices = invoiceCountResult.count ?? 0;
  const totalCustomers = customerCountResult.count ?? 0;

  const monthlySales = (monthlyInvoicesResult.data ?? []).reduce(
    (total, invoice) => total + Number(invoice.grand_total ?? 0),
    0
  );

  const recentInvoices = recentInvoicesResult.data ?? [];

  return (
    <main className="min-h-screen bg-[#080b10] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <section className="mb-10">
          <p className="text-sm text-slate-400">Welcome back</p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            {station.station_name}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {station.address}
          </p>
        </section>

        {/* Overview */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Total Invoices"
            description="All saved invoice records"
            value={totalInvoices.toLocaleString("en-LK")}
          />

          <DashboardCard
            title="Customers"
            description="Registered customers"
            value={totalCustomers.toLocaleString("en-LK")}
          />

          <DashboardCard
            title="Monthly Sales"
            description="Current month, excluding void invoices"
            value={formatLKR(monthlySales)}
          />
        </section>

        {/* Quick Actions */}
        <section className="mt-12">
          <h3 className="mb-5 text-lg font-semibold">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              title="Create Invoice"
              description="Generate a new fuel VAT invoice."
              href="/invoice/form"
            />

            <QuickAction
              title="View Invoices"
              description="View, review, and print saved invoices."
              href="/invoice"
            />

            <QuickAction
              title="Manage Customers"
              description="Add and manage your customers."
              href="/customers"
            />

            <QuickAction
              title="Station Profile"
              description="View your station information."
              href="/station"
            />
          </div>
        </section>

        {/* Recent Invoices */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Recent Invoices</h3>
              <p className="mt-1 text-sm text-slate-500">
                Your latest saved invoice records
              </p>
            </div>

            <Link
              href="/invoice"
              className="text-sm font-semibold text-emerald-300 underline underline-offset-4 transition hover:text-emerald-200"
            >
              View all invoices →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e1219]">
            {recentInvoices.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-medium">No invoices yet</p>
                <p className="mt-2 text-sm text-slate-400">
                  Create your first invoice to see it here.
                </p>

                <Link
                  href="/invoice/form"
                  className="mt-5 inline-block rounded-lg bg-emerald-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
                >
                  Create Invoice
                </Link>
              </div>
            ) : (
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b border-white/[0.08] bg-white/[0.025] text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Invoice Number</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-medium">
                        {invoice.invoice_number}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {formatDate(invoice.invoice_date)}
                      </td>

                      <td className="px-5 py-4">
                        {invoice.buyer_name}
                      </td>

                      <td className="px-5 py-4 text-right font-medium">
                        {formatLKR(Number(invoice.grand_total ?? 0))}
                      </td>

                      <td className="px-5 py-4">
                        <StatusLabel status={invoice.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/invoice`}
                          className="font-medium text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Station Information */}
        <section className="mt-12 rounded-2xl border border-white/[0.08] bg-[#0e1219] p-6">
          <h3 className="mb-5 text-lg font-semibold">
            Station Information
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <InfoItem
              label="Station Name"
              value={station.station_name}
            />

            <InfoItem
              label="Address"
              value={station.address}
            />

            <InfoItem
              label="TIN Number"
              value={station.tin_number}
            />

            <InfoItem
              label="VAT Number"
              value={station.vat_number}
            />

            <InfoItem
              label="Account Number"
              value={station.account_number}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0e1219] p-6">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-4 break-words text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-[#0e1219] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-[#111821]"
    >
      <h4 className="font-semibold group-hover:underline">{title}</h4>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <p className="mt-5 text-sm font-medium text-emerald-300">Open →</p>
    </Link>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-200">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatusLabel({ status }: { status: string | null }) {
  const normalized = (status || "unknown").toLowerCase();
  const styles: Record<string, string> = {
    issued: "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200",
    draft: "border-amber-300/20 bg-amber-300/[0.08] text-amber-200",
    void: "border-red-300/20 bg-red-300/[0.08] text-red-200",
  };

  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-xs capitalize ${
      styles[normalized] ?? "border-white/10 bg-white/[0.04] text-slate-300"
    }`}>
      {normalized}
    </span>
  );
}