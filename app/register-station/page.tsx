"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterStationPage() {
  const supabase = createClient();
  const router = useRouter();

  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setMessage("Please log in before registering your station.");
      return;
    }

    const { error } = await supabase.from("fuel_stations").insert({
      owner_id: user.id,
      station_name: stationName,
      address,
      tin_number: tinNumber,
      vat_number: vatNumber,
      account_number: accountNumber,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#0b0f15] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b10] px-4 py-10 text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-emerald-300/[0.07] blur-[110px]" />
      <div className="w-full max-w-xl">

        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Fuel VAT Invoice Manager
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Register Your Station
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter your fuel station information to get started.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#11161e] p-6 shadow-2xl sm:p-8">

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Station Name
              </label>

              <input
                type="text"
                required
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className={inputClass}
                placeholder="Enter station name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Station Address
              </label>

              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
                placeholder="Enter station address"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  TIN Number
                </label>

                <input
                  type="text"
                  required
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Enter TIN"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  VAT Number
                </label>

                <input
                  type="text"
                  required
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Enter VAT number"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Station Account Number
              </label>

              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={inputClass}
                placeholder="Enter account number"
              />
            </div>

            {message && (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registering Station..." : "Register Station"}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Your station information will be securely associated with your account.
        </p>

      </div>
    </main>
  );
}