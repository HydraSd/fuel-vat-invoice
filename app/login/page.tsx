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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">
          Welcome Back
        </h1>

        <p className="mb-6 text-sm text-gray-500">
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
              className="w-full rounded-lg border p-3"
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
              className="w-full rounded-lg border p-3"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Checking your account..." : "Login"}
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}