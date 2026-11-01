"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    // Authenticate user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setErrorMessage("Unable to retrieve user information.");
      setLoading(false);
      return;
    }

    // Check whether this user already has a fuel station
    const { data: station, error: stationError } = await supabase
      .from("fuel_stations")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (stationError) {
      console.error("Station lookup error:", stationError);

      setErrorMessage(
        "Login successful, but we couldn't check your station details. Please try again."
      );

      setLoading(false);
      return;
    }

    // Redirect depending on station registration
    if (station) {
      router.replace("/dashboard");
    } else {
      router.replace("/register-station");
    }

    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b10] p-4 text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-emerald-300/[0.08] blur-[100px]" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#11161e] p-8 shadow-2xl">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">
          Welcome Back
        </h1>

        <p className="mb-6 text-sm text-slate-400">
          Login to manage your fuel station invoices.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0b0f15] p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0b0f15] p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-300 p-3 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking your account..." : "Login"}
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/[0.07] p-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}