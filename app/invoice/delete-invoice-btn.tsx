"use client";

import { deleteInvoiceAction } from "./actions";

export default function DeleteInvoiceButton({
  invoiceId,
}: {
  invoiceId: string;
}) {
  return (
    <form
      action={deleteInvoiceAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to permanently delete this invoice? This action cannot be undone."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input
        type="hidden"
        name="invoice_id"
        value={invoiceId}
      />

      <button
        type="submit"
        className="whitespace-nowrap font-semibold text-red-300 underline underline-offset-4 hover:text-red-200"
      >
        Delete
      </button>
    </form>
  );
}