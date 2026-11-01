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
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-xl">

        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Fuel VAT Invoice Manager
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-black">
            Register Your Station
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter your fuel station information to get started.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-black">
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
              <label className="mb-2 block text-sm font-medium text-black">
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
                <label className="mb-2 block text-sm font-medium text-black">
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
                <label className="mb-2 block text-sm font-medium text-black">
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
              <label className="mb-2 block text-sm font-medium text-black">
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
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-black">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registering Station..." : "Register Station"}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your station information will be securely associated with your account.
        </p>

      </div>
    </main>
  );
}