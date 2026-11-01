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
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">Fuel VAT Manager</h1>
            <p className="text-xs text-gray-500">Customer Management</p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
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
          <p className="mt-2 text-sm text-gray-500">
            Manage your corporate and regular fuel customers.
          </p>
        </div>

        {/* Customer form */}
        <section className="mb-10 rounded-xl border border-gray-200 p-6 sm:p-8">
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
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                {message}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
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
                  className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium hover:bg-gray-100"
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

            <span className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600">
              {customers.length} customers
            </span>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Loading customers...
            </p>
          ) : customers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <p className="font-medium">No customers yet</p>
              <p className="mt-2 text-sm text-gray-500">
                Add your first customer using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">TIN</th>
                    <th className="px-5 py-4 font-semibold">VAT</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {customer.customer_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {customer.address}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {customer.tin_number || "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
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
                            className="font-medium text-gray-500 hover:text-black hover:underline"
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