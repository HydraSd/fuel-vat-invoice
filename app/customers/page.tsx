"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  station_id: string;
  customer_name: string;
  address: string;
  tin_number: string | null;
  vat_number: string | null;
};

const emptyForm = {
  customer_name: "",
  address: "",
  tin_number: "",
  vat_number: "",
};

export default function CustomersPage() {
  const supabase = createClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stationId, setStationId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Please log in to manage customers.");
      setLoading(false);
      return;
    }

    const { data: station, error: stationError } = await supabase
      .from("fuel_stations")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (stationError || !station) {
      setMessage("Unable to find your registered fuel station.");
      setLoading(false);
      return;
    }

    setStationId(station.id);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("station_id", station.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setCustomers(data ?? []);
    }

    setLoading(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!stationId) {
      setMessage("Station information is missing.");
      return;
    }

    setSaving(true);
    setMessage("");

    const customerData = {
      customer_name: form.customer_name.trim(),
      address: form.address.trim(),
      tin_number: form.tin_number.trim() || null,
      vat_number: form.vat_number.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", editingId)
        .eq("station_id", stationId);

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Customer updated successfully.");
        setEditingId(null);
        setForm(emptyForm);
        await loadCustomers();
      }
    } else {
      const { error } = await supabase.from("customers").insert({
        ...customerData,
        station_id: stationId,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Customer added successfully.");
        setForm(emptyForm);
        await loadCustomers();
      }
    }

    setSaving(false);
  }

  function startEditing(customer: Customer) {
    setEditingId(customer.id);

    setForm({
      customer_name: customer.customer_name,
      address: customer.address,
      tin_number: customer.tin_number ?? "",
      vat_number: customer.vat_number ?? "",
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCustomer(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("station_id", stationId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Customer deleted successfully.");
      await loadCustomers();
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10";

  return (
    <main className="min-h-screen bg-[#080b10] text-slate-100">
      {/* Header */}
      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold text-white">Fuel VAT Manager</h1>
            <p className="text-xs text-slate-500">Customer Management</p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Customers
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage your corporate and regular fuel customers.
          </p>
        </div>

        {/* Customer form */}
        <section className="mb-10 rounded-2xl border border-white/[0.08] bg-[#0e1219] p-6 sm:p-8">
          <h3 className="mb-6 text-lg font-semibold">
            {editingId ? "Edit Customer" : "Add New Customer"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Customer Name *
                </label>

                <input
                  name="customer_name"
                  required
                  value={form.customer_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  TIN Number
                </label>

                <input
                  name="tin_number"
                  value={form.tin_number}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter TIN number"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Address *
              </label>

              <textarea
                name="address"
                required
                value={form.address}
                onChange={handleChange}
                className={`${inputClass} min-h-24 resize-y`}
                placeholder="Enter customer address"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                VAT Number
              </label>

              <input
                name="vat_number"
                value={form.vat_number}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter VAT number"
              />
            </div>

            {message && (
              <p className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
                {message}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Customer"
                    : "Add Customer"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Customer list */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Registered Customers
            </h3>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-slate-400">
              {customers.length} customers
            </span>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Loading customers...
            </p>
          ) : customers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#0e1219] py-16 text-center">
              <p className="font-medium">No customers yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Add your first customer using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0e1219]">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-white/[0.08] bg-white/[0.025] text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">TIN</th>
                    <th className="px-5 py-4 font-semibold">VAT</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {customer.customer_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {customer.address}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {customer.tin_number || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {customer.vat_number || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => startEditing(customer)}
                            className="font-medium hover:underline"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="font-medium text-slate-500 hover:text-red-300 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}