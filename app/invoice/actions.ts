"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteInvoiceAction(formData: FormData) {
  const supabase = await createClient();

  const invoiceId = formData.get("invoice_id");

  if (typeof invoiceId !== "string" || !invoiceId.trim()) {
    redirect("/invoice?error=invalid");
  }

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
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (stationError || !station) {
    console.error("Station lookup error:", stationError);
    redirect("/invoice?error=station");
  }

  // Delete only an invoice belonging to this station
  const { data, error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("station_id", station.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Invoice deletion error:", error);
    redirect("/invoice?error=delete");
  }

  if (!data) {
    redirect("/invoice?error=notfound");
  }

  // Refresh dashboard and invoice listing
  revalidatePath("/dashboard");
  revalidatePath("/invoice");

  redirect("/invoice?deleted=1");
}