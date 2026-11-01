import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteInvoiceButton from "./delete-invoice-btn";

type SearchParams = {
  search?: string | string[];
  status?: string | string[];
  fuel?: string | string[];
  from?: string | string[];
  to?: string | string[];
  deleted?: string | string[];
  error?: string | string[];
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

function getParam(
  params: SearchParams,
  key: keyof SearchParams
): string {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
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

function StatusLabel({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    issued: "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200",
    draft: "border-amber-300/20 bg-amber-300/[0.08] text-amber-200",
    void: "border-red-300/20 bg-red-300/[0.08] text-red-200",
  };

  const normalizedStatus = status?.toLowerCase() ?? "";

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-1 text-xs capitalize ${
        styles[normalizedStatus] ?? "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

export default async function InvoicesPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

  const search = getParam(params, "search").trim();
  const status = getParam(params, "status");
  const fuel = getParam(params, "fuel");
  const from = getParam(params, "from");
  const to = getParam(params, "to");
  const deleted = getParam(params, "deleted");
  const errorMessage = getParam(params, "error");

  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Find the user's station
  const { data: station, error: stationError } = await supabase
    .from("fuel_stations")
    .select("id, station_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (stationError) {
    console.error("Station error:", stationError);
    throw new Error("Unable to load station information.");
  }

  if (!station) {
    redirect("/register-station");
  }

  // Start the invoice query
  let invoiceQuery = supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      invoice_date,
      buyer_name,
      buyer_tin,
      buyer_vat,
      buyer_address,
      customer_id,
      product_type,
      petrol_unit_price,
      petrol_quantity,
      diesel_unit_price,
      diesel_quantity,
      vat_rate,
      subtotal,
      vat_amount,
      grand_total,
      status,
      created_at
    `)
    .eq("station_id", station.id);

  // Search invoice number, buyer name, or buyer TIN.
  // Restrict special characters so user input cannot alter
  // the PostgREST OR filter expression.
  if (search) {
    const safeSearch = search.replace(/[^a-zA-Z0-9\s./-]/g, "").trim();

    if (safeSearch) {
      invoiceQuery = invoiceQuery.or(
        `invoice_number.ilike.%${safeSearch}%,buyer_name.ilike.%${safeSearch}%,buyer_tin.ilike.%${safeSearch}%`
      );
    }
  }

  // Status filter
  const allowedStatuses = ["issued", "draft", "void"];

  if (allowedStatuses.includes(status)) {
    invoiceQuery = invoiceQuery.eq("status", status);
  }

  // Fuel type filter
  const allowedFuelTypes = ["petrol", "diesel", "both"];

  if (allowedFuelTypes.includes(fuel)) {
    invoiceQuery = invoiceQuery.eq("product_type", fuel);
  }

  // Date range filters
  if (isValidDate(from)) {
    invoiceQuery = invoiceQuery.gte("invoice_date", from);
  }

  if (isValidDate(to)) {
    invoiceQuery = invoiceQuery.lte("invoice_date", to);
  }

  // Newest invoices first
  const { data: invoices, error: invoicesError } = await invoiceQuery
    .order("invoice_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (invoicesError) {
    console.error("Invoice loading error:", invoicesError);
    throw new Error("Unable to load invoices.");
  }

  const invoiceList = invoices ?? [];

  const totalSales = invoiceList
    .filter((invoice) => invoice.status !== "void")
    .reduce(
      (total, invoice) => total + Number(invoice.grand_total ?? 0),
      0
    );

  const hasFilters = Boolean(search || status || fuel || from || to);

  return (
    <main className="min-h-screen bg-[#080b10] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page title */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Invoices
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Search, filter, view, and manage your saved fuel VAT invoices.
            </p>
          </div>

          <Link
            href="/invoice/form"
            className="rounded-lg bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
          >
            + Create Invoice
          </Link>
        </div>

        {/* Success message */}
        {deleted === "1" && (
          <div className="mb-6 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.07] p-4 text-sm text-emerald-200">
            Invoice deleted successfully.
          </div>
        )}

        {/* Error messages */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-300/20 bg-red-300/[0.07] p-4 text-sm text-red-200">
            {errorMessage === "invalid" &&
              "Invalid invoice selected."}

            {errorMessage === "station" &&
              "Unable to identify your station."}

            {errorMessage === "delete" &&
              "Unable to delete the invoice. Please try again."}

            {errorMessage === "notfound" &&
              "Invoice not found or you do not have permission to delete it."}
          </div>
        )}

        {/* Summary */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0e1219] p-6">
            <p className="text-sm text-slate-400">
              Matching Invoices
            </p>

            <p className="mt-3 text-3xl font-bold">
              {invoiceList.length.toLocaleString("en-LK")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0e1219] p-6">
            <p className="text-sm text-slate-400">
              Matching Sales (excluding void invoices)
            </p>

            <p className="mt-3 break-words text-2xl font-bold">
              {formatLKR(totalSales)}
            </p>
          </div>
        </section>

        {/* Search and filters */}
        <section className="mb-8 rounded-2xl border border-white/[0.08] bg-[#0e1219] p-6">
          <div className="mb-5">
            <h3 className="font-semibold">Search and Filters</h3>

            <p className="mt-1 text-xs text-slate-500">
              Find invoices using invoice details, status, fuel type, or date.
            </p>
          </div>

          <form method="GET" action="/invoice">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="search"
                  className="mb-2 block text-sm font-medium"
                >
                  Search
                </label>

                <input
                  id="search"
                  name="search"
                  type="search"
                  defaultValue={search}
                  placeholder="Invoice number, buyer name, or TIN..."
                  className="w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-medium"
                >
                  Invoice Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={status}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                >
                  <option value="">All statuses</option>
                  <option value="issued">Issued</option>
                  <option value="draft">Draft</option>
                  <option value="void">Void</option>
                </select>
              </div>

              {/* Fuel type */}
              <div>
                <label
                  htmlFor="fuel"
                  className="mb-2 block text-sm font-medium"
                >
                  Fuel Type
                </label>

                <select
                  id="fuel"
                  name="fuel"
                  defaultValue={fuel}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                >
                  <option value="">All fuel types</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="both">Petrol & Diesel</option>
                </select>
              </div>

              {/* From date */}
              <div>
                <label
                  htmlFor="from"
                  className="mb-2 block text-sm font-medium"
                >
                  From Date
                </label>

                <input
                  id="from"
                  name="from"
                  type="date"
                  defaultValue={from}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                />
              </div>

              {/* To date */}
              <div>
                <label
                  htmlFor="to"
                  className="mb-2 block text-sm font-medium"
                >
                  To Date
                </label>

                <input
                  id="to"
                  name="to"
                  type="date"
                  defaultValue={to}
                  className="w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
              >
                Search / Filter
              </button>

              <Link
                href="/invoice"
                className="rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Reset Filters
              </Link>
            </div>
          </form>
        </section>

        {/* Invoice table */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1219]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-6 py-4">
            <div>
              <h3 className="font-semibold">Invoice Records</h3>

              <p className="mt-1 text-xs text-slate-500">
                {invoiceList.length} matching invoice record(s)
                {hasFilters ? " after applying filters" : ""}
              </p>
            </div>
          </div>

          {invoiceList.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="font-semibold">
                {hasFilters ? "No matching invoices" : "No invoices found"}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {hasFilters
                  ? "Try changing your search or filter options."
                  : "Your saved invoices will appear here."}
              </p>

              {hasFilters ? (
                <Link
                  href="/invoice"
                  className="mt-5 inline-block rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Clear Filters
                </Link>
              ) : (
                <Link
                  href="/invoice/form"
                  className="mt-5 inline-block rounded-lg bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
                >
                  Create Your First Invoice
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-white/[0.08] bg-white/[0.025] text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Invoice Number</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Buyer</th>
                    <th className="px-5 py-4">Fuel</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {invoiceList.map((invoice) => {
                    const params = new URLSearchParams();

                    params.set(
                      "invoice_number",
                      invoice.invoice_number ?? ""
                    );
                    params.set(
                      "invoice_date",
                      invoice.invoice_date ?? ""
                    );
                    params.set("buyer_name", invoice.buyer_name ?? "");
                    params.set(
                      "buyer_address",
                      invoice.buyer_address ?? ""
                    );
                    params.set("buyer_tin_no", invoice.buyer_tin ?? "");
                    params.set(
                      "buyer_vat_number",
                      invoice.buyer_vat ?? ""
                    );
                    params.set("product_type", invoice.product_type ?? "");

                    params.set(
                      "petrol_unit_price",
                      invoice.petrol_unit_price?.toString() ?? ""
                    );
                    params.set(
                      "petrol_quantity",
                      invoice.petrol_quantity?.toString() ?? ""
                    );
                    params.set(
                      "diesel_unit_price",
                      invoice.diesel_unit_price?.toString() ?? ""
                    );
                    params.set(
                      "diesel_quantity",
                      invoice.diesel_quantity?.toString() ?? ""
                    );
                    params.set(
                      "customer_id",
                      invoice.customer_id ?? ""
                    );

                    // Prevent saving the same invoice again.
                    params.set("saved", "1");

                    const previewUrl =
                      `/invoice/preview?${params.toString()}`;

                    return (
                      <tr
                        key={invoice.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 font-medium">
                          {invoice.invoice_number}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {formatDate(invoice.invoice_date)}
                        </td>

                        <td className="px-5 py-4">
                          <div>{invoice.buyer_name}</div>

                          {invoice.buyer_tin && (
                            <div className="mt-1 text-xs text-slate-500">
                              TIN: {invoice.buyer_tin}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 capitalize text-slate-400">
                          {invoice.product_type === "both"
                            ? "Petrol & Diesel"
                            : invoice.product_type}
                        </td>

                        <td className="px-5 py-4 text-right font-medium">
                          {formatLKR(Number(invoice.grand_total ?? 0))}
                        </td>

                        <td className="px-5 py-4">
                          <StatusLabel status={invoice.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            <Link
                              href={previewUrl}
                              className="whitespace-nowrap font-semibold text-emerald-300 underline underline-offset-4 hover:text-emerald-200"
                            >
                              View / Print
                            </Link>

                            <DeleteInvoiceButton invoiceId={invoice.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}