import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

import { formatLKRInWords } from './utils/currency-convertor'
import PrintButton from './components/print-btn'
import { extendedAmount } from './utils/extended'
import { formatDate } from '../form/utils/date-format'

import { createClient } from '@/lib/supabase/server'

type SearchParamsValue = string | string[] | undefined

type Props = {
  searchParams?: Promise<Record<string, SearchParamsValue>>
}

function getValue(value: SearchParamsValue) {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Save invoice to Supabase.
 * This is a server action, so the Supabase server client
 * handles authentication using the user's session cookies.
 */
async function saveInvoiceAction(formData: FormData) {
  'use server'

  const supabase = await createClient()

  const returnQuery = getFormString(formData, 'return_query')

  function redirectWithStatus(key: string, value: string): never {
    const query = new URLSearchParams(returnQuery)
    query.set(key, value)

    redirect(`/invoice/preview?${query.toString()}`)
  }

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Get this user's fuel station
  const { data: station, error: stationError } = await supabase
    .from('fuel_stations')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (stationError || !station) {
    redirectWithStatus('save_error', 'station')
  }

  // 3. Read invoice information
  const invoiceNumber = getFormString(formData, 'invoice_number')
  const invoiceDate = getFormString(formData, 'invoice_date')

  const buyerName = getFormString(formData, 'buyer_name')
  const buyerAddress = getFormString(formData, 'buyer_address')
  const buyerVat = getFormString(formData, 'buyer_vat_number')
  const buyerTin = getFormString(formData, 'buyer_tin_no')

  const productType = getFormString(formData, 'product_type')
  const customerId = getFormString(formData, 'customer_id')

  // 4. Validate basic invoice information
  if (
    !invoiceNumber ||
    !invoiceDate ||
    !buyerName ||
    !buyerAddress ||
    !buyerVat ||
    !buyerTin
  ) {
    redirectWithStatus('save_error', 'invalid')
  }

  if (Number.isNaN(Date.parse(invoiceDate))) {
    redirectWithStatus('save_error', 'invalid')
  }

  if (!['petrol', 'diesel', 'both'].includes(productType)) {
    redirectWithStatus('save_error', 'invalid')
  }

  // 5. Determine selected fuel types
  const hasPetrol = productType === 'petrol' || productType === 'both'
  const hasDiesel = productType === 'diesel' || productType === 'both'

  const petrolPriceInput = getFormString(formData, 'petrol_unit_price')
  const petrolQuantityInput = getFormString(formData, 'petrol_quantity')

  const dieselPriceInput = getFormString(formData, 'diesel_unit_price')
  const dieselQuantityInput = getFormString(formData, 'diesel_quantity')

  const petrolUnitPrice = hasPetrol ? Number(petrolPriceInput) : null
  const petrolQuantity = hasPetrol ? Number(petrolQuantityInput) : null

  const dieselUnitPrice = hasDiesel ? Number(dieselPriceInput) : null
  const dieselQuantity = hasDiesel ? Number(dieselQuantityInput) : null

  // Validate selected fuel sections
  if (
    hasPetrol &&
    (
      petrolPriceInput === '' ||
      petrolQuantityInput === '' ||
      !Number.isFinite(petrolUnitPrice) ||
      !Number.isFinite(petrolQuantity) ||
      petrolUnitPrice! < 0 ||
      petrolQuantity! <= 0
    )
  ) {
    redirectWithStatus('save_error', 'invalid')
  }

  if (
    hasDiesel &&
    (
      dieselPriceInput === '' ||
      dieselQuantityInput === '' ||
      !Number.isFinite(dieselUnitPrice) ||
      !Number.isFinite(dieselQuantity) ||
      dieselUnitPrice! < 0 ||
      dieselQuantity! <= 0
    )
  ) {
    redirectWithStatus('save_error', 'invalid')
  }

  // 6. Verify that the selected customer belongs to this station
  if (customerId) {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customerId)
      .eq('station_id', station.id)
      .maybeSingle()

    if (customerError || !customer) {
      redirectWithStatus('save_error', 'customer')
    }
  }

  // 7. Calculate invoice totals
  // The invoice form uses VAT-inclusive fuel amounts.
  const vatRate = 0.18

  const petrolTotal =
    hasPetrol
      ? petrolUnitPrice! * petrolQuantity!
      : 0

  const dieselTotal =
    hasDiesel
      ? dieselUnitPrice! * dieselQuantity!
      : 0

  const subtotal =
    extendedAmount(petrolTotal, vatRate) +
    extendedAmount(dieselTotal, vatRate)

  const vatAmount = subtotal * vatRate
  const grandTotal = subtotal + vatAmount

  // 8. Prepare Supabase invoice record
  const invoiceData = {
    station_id: station.id,
    customer_id: customerId || null,

    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,

    buyer_name: buyerName,
    buyer_address: buyerAddress,
    buyer_vat: buyerVat,
    buyer_tin: buyerTin,

    product_type: productType,

    petrol_unit_price: petrolUnitPrice,
    petrol_quantity: petrolQuantity,

    diesel_unit_price: dieselUnitPrice,
    diesel_quantity: dieselQuantity,

    vat_rate: 18,
    subtotal,
    vat_amount: vatAmount,
    grand_total: grandTotal,

    status: 'issued',
  }

  // 9. Insert invoice
  const { error: insertError } = await supabase
    .from('invoices')
    .insert(invoiceData)

  if (insertError) {
    // PostgreSQL unique constraint violation:
    // An invoice with this number already exists for this station.
    if (insertError.code === '23505') {
      redirectWithStatus('save_error', 'duplicate')
    }

    console.error('Invoice save error:', insertError)

    redirectWithStatus('save_error', 'database')
  }

  // 10. Return to preview with success status
  redirectWithStatus('saved', '1')
}

export default async function InvoicePreviewPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {}

  // Preserve the original invoice data for the Back to Form link
  const backQuery = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string' && item.trim() !== '') {
          backQuery.append(key, item)
        }
      })
    } else if (typeof value === 'string' && value.trim() !== '') {
      backQuery.set(key, value)
    }
  }

  // Do not carry save messages back into the form
  backQuery.delete('saved')
  backQuery.delete('save_error')

  const saved = getValue(params.saved) === '1'
  const saveError = getValue(params.save_error)

  // Invoice details
  const invoiceDate = getValue(params.invoice_date) || '-'

  const formatedDate =
    invoiceDate === '-'
      ? '-'
      : formatDate(new Date(invoiceDate))

  const invoiceNumber = getValue(params.invoice_number) || '-'

  // Buyer information
  const buyerName = getValue(params.buyer_name) || '-'
  const buyerAddress = getValue(params.buyer_address) || '-'
  const buyerVat = getValue(params.buyer_vat_number) || '-'
  const buyerTin = getValue(params.buyer_tin_no) || '-'

  const customerId = getValue(params.customer_id)

  // Product information
  const productType =
    (['petrol', 'both', 'diesel'] as const).find(
      (type) => type === getValue(params.product_type)
    ) ?? 'petrol'

  const petrolUnitPrice = Number(
    getValue(params.petrol_unit_price) || 0
  )

  const petrolQuantity = Number(
    getValue(params.petrol_quantity) || 0
  )

  const dieselUnitPrice = Number(
    getValue(params.diesel_unit_price) || 0
  )

  const dieselQuantity = Number(
    getValue(params.diesel_quantity) || 0
  )

  // Calculations
  const petrolTotal = petrolUnitPrice * petrolQuantity
  const dieselTotal = dieselUnitPrice * dieselQuantity

  const vatRate = 0.18

  const subtotalExcludingVat =
    extendedAmount(petrolTotal, vatRate) +
    extendedAmount(dieselTotal, vatRate)

  const vatAmount = subtotalExcludingVat * vatRate

  const grandTotal = subtotalExcludingVat + vatAmount

  const hasPetrol =
    productType === 'petrol' || productType === 'both'

  const hasDiesel =
    productType === 'diesel' || productType === 'both'

  const formatLKR = (amount: number) =>
    `Rs.${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const saveErrorMessages: Record<string, string> = {
    station: 'Your fuel station could not be found. Please register your station first.',
    invalid: 'Some invoice information is missing or invalid. Please return to the form and check it.',
    customer: 'The selected customer could not be found for your station. Please select the customer again.',
    duplicate: 'An invoice with this invoice number already exists. Please use a different invoice number.',
    database: 'The invoice could not be saved. Please check your database configuration and try again.',
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">

      {/* Top Action Bar */}
      <div className="mx-auto mb-4 flex max-w-4xl flex-wrap items-center justify-between gap-3">

        <Link
          href={
            backQuery.toString()
              ? `/invoice/form?${backQuery.toString()}`
              : '/invoice/form'
          }
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Back to Form
        </Link>

        {/* Save Invoice */}
        {!saved ? (
          <form action={saveInvoiceAction}>
            <input
              type="hidden"
              name="return_query"
              value={backQuery.toString()}
            />

            {[
              'invoice_number',
              'invoice_date',
              'buyer_name',
              'buyer_address',
              'buyer_vat_number',
              'buyer_tin_no',
              'product_type',
              'petrol_unit_price',
              'petrol_quantity',
              'diesel_unit_price',
              'diesel_quantity',
              'customer_id',
            ].map((name) => (
              <input
                key={name}
                type="hidden"
                name={name}
                value={getValue(params[name])}
              />
            ))}

            <button
              type="submit"
              className="rounded-md bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save Invoice
            </button>
          </form>
        ) : (
          <div className="rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800">
            Invoice saved successfully
          </div>
        )}
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="mx-auto mb-4 max-w-4xl rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {saveErrorMessages[saveError] || 'An unexpected error occurred.'}
        </div>
      )}

      {/* Save Success */}
      {saved && (
        <div className="mx-auto mb-4 max-w-4xl rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Your invoice has been saved to your account. You can now print it.
        </div>
      )}

      {/* Invoice Document Sheet */}
      <div className="mx-auto max-w-4xl rounded-sm bg-white p-6 text-sm text-slate-800 shadow-md ring-1 ring-slate-200 md:p-10">

        {/* Header Section */}
        <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-4">

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              LAKMINI ENTERPRISES
            </h1>

            <p className="text-xs font-semibold text-slate-700">
              SHELL FILLING STATION
            </p>

            <p className="text-xs text-slate-600">
              82, PASYALA - GIRIULLA ROAD,
            </p>

            <p className="text-xs text-slate-600">
              MIRIGAMA
            </p>

            <p className="text-xs text-slate-600">
              ACC No: 610141
            </p>

            <p className="text-xs text-slate-600">
              Tel: 0332 273 209 | Fax: 0332 273 209
            </p>
          </div>

          <div className="text-right">
            <div className="inline-block">
              <Image
                src="/shell.png"
                width={100}
                height={100}
                alt="Shell"
                loading="lazy"
              />
            </div>

            <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900">
              TAX INVOICE
            </h2>

            <p className="text-xs text-slate-600">
              <span className="font-semibold">Date:</span> {formatedDate}
            </p>

            <p className="text-xs text-slate-600">
              <span className="font-semibold">INVOICE NUMBER:</span> {invoiceNumber}
            </p>
          </div>
        </div>

        {/* Seller & Buyer Information */}
        <div className="grid grid-cols-2 gap-6 border-b border-slate-300 py-4">

          {/* Seller Details */}
          <div className="space-y-1">
            <h3 className="mb-1 border-b border-slate-200 pb-1 text-xs font-bold uppercase text-slate-900">
              SELLER
            </h3>

            <p className="font-semibold text-slate-800">
              LAKMINI ENTERPRISES
            </p>

            <p className="text-xs text-slate-600">
              82, PASYALA ROAD, MIRIGAMA
            </p>

            <p className="text-xs text-slate-600">
              <span className="font-semibold">VAT Reg No:</span> 934033728-7000
            </p>

            <p className="text-xs text-slate-600">
              <span className="font-semibold">TIN No:</span> 934033728
            </p>
          </div>

          {/* Buyer Details */}
          <div className="space-y-1">
            <h3 className="mb-1 border-b border-slate-200 pb-1 text-xs font-bold uppercase text-slate-900">
              BUYER
            </h3>

            <p className="font-semibold text-slate-800">
              {buyerName}
            </p>

            <p className="text-xs text-slate-600">
              {buyerAddress}
            </p>

            <p className="text-xs text-slate-600">
              <span className="font-semibold">VAT Reg No:</span> {buyerVat}
            </p>

            <p className="text-xs text-slate-600">
              <span className="font-semibold">TIN No:</span> {buyerTin}
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-xs">

            <thead>
              <tr className="bg-slate-100 font-bold uppercase text-slate-800">
                <th className="w-12 border border-slate-300 px-2 py-2 text-center">
                  SN
                </th>

                <th className="border border-slate-300 px-3 py-2 text-left">
                  DESCRIPTION
                </th>

                <th className="border border-slate-300 px-2 py-2 text-right">
                  Qty. (L)
                </th>

                <th className="border border-slate-300 px-2 py-2 text-right">
                  UNIT RATE (LKR/Ltr)
                </th>

                <th className="border border-slate-300 px-2 py-2 text-right">
                  EXTENDED AMOUNT (LKR)
                </th>

                <th className="border border-slate-300 px-2 py-2 text-right">
                  NET AMOUNT (LKR)
                </th>
              </tr>
            </thead>

            <tbody>
              {hasPetrol && (
                <tr>
                  <td className="border border-slate-300 px-2 py-2 text-center">
                    1
                  </td>

                  <td className="border border-slate-300 px-3 py-2 font-semibold">
                    PETROL
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {petrolQuantity.toFixed(2)}
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {petrolUnitPrice > 0 ? petrolUnitPrice.toFixed(2) : ''}
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {extendedAmount(petrolTotal, vatRate).toFixed(2)}
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {petrolTotal.toFixed(2)}
                  </td>
                </tr>
              )}

              {hasDiesel && (
                <tr>
                  <td className="border border-slate-300 px-2 py-2 text-center">
                    {hasPetrol ? 2 : 1}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 font-semibold">
                    DIESEL
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {dieselQuantity.toFixed(2)}
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {dieselUnitPrice > 0 ? dieselUnitPrice.toFixed(2) : ''}
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {extendedAmount(dieselTotal, vatRate).toFixed(2)}
                  </td>

                  <td className="border border-slate-300 px-2 py-2 text-right">
                    {dieselTotal.toFixed(2)}
                  </td>
                </tr>
              )}

              {!hasPetrol && !hasDiesel && (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-slate-300 px-3 py-4 text-center text-slate-500"
                  >
                    No items selected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="mt-4 flex flex-col items-end text-xs">
          <div className="w-full max-w-xs space-y-1 border border-slate-300 bg-slate-50 p-2">

            <div className="flex justify-between">
              <span className="font-semibold text-slate-700">
                EXCLUDING VAT
              </span>

              <span>{formatLKR(subtotalExcludingVat)}</span>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-1">
              <span className="font-semibold text-slate-700">
                VAT (18%)
              </span>

              <span>{formatLKR(vatAmount)}</span>
            </div>

            <div className="flex justify-between border-t border-slate-300 pt-1 text-sm font-bold text-slate-900">
              <span>TOTAL</span>

              <span>{formatLKR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Total in words */}
        <div className="mt-3 border-b border-t border-slate-300 py-1 text-xs font-semibold uppercase text-slate-800">
          TOTAL IN LKR:{' '}
          {grandTotal === 0
            ? 'ZERO RUPEES ONLY'
            : `${formatLKRInWords(grandTotal)} `}
        </div>

        {/* Footer: Bank Details & Signature */}
        <div className="mt-6 grid grid-cols-2 gap-4 pt-2 text-xs">

          {/* Bank Details */}
          <div className="space-y-1">
            <h4 className="mb-1 border-b border-slate-200 pb-0.5 font-bold uppercase text-slate-900">
              BANK DETAILS
            </h4>

            <p>
              <span className="font-semibold">BANK NAME:</span>{' '}
              COMMERCIAL BANK OF CEYLON
            </p>

            <p>
              <span className="font-semibold">BANK BRANCH:</span>{' '}
              MIRIGAMA BRANCH
            </p>

            <p>
              <span className="font-semibold">ACCOUNT NUMBER:</span>{' '}
              1000358108
            </p>

            <p>
              <span className="font-semibold">ACCOUNT NAME:</span>{' '}
              LAKMINI ENTERPRISES
            </p>

            <div className="mt-3 text-[11px] text-slate-600">
              <p>For any concerns, contact 070 567 4240 / 076 689 1534</p>
              <p>Please WhatsApp your payment slip to 070 598 0294</p>
            </div>
          </div>

          {/* Signature / Stamp */}
          <div className="flex flex-col items-center justify-end">
            <div className="flex h-24 w-48 items-center justify-center rounded border border-dashed border-slate-300 p-2 text-center text-xs text-slate-400">
              Signature and Stamp
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="mx-auto max-w-4xl">
        <PrintButton
          invoice_number={invoiceNumber}
          invoice_date={invoiceDate}
          buyer_name={buyerName}
          buyerAddress={buyerAddress}
          buyerVat={buyerVat}
          buyerTin={buyerTin}
          productType={productType}
          petrolUnitPrice={petrolUnitPrice}
          petrolQuantity={petrolQuantity}
          dieselUnitPrice={dieselUnitPrice}
          dieselQuantity={dieselQuantity}
          vatRate={vatRate}
          vatAmount={vatAmount}
          grandTotal={grandTotal}
        />
      </div>
    </main>
  )
}