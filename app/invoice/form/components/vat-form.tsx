'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { SubmitButton } from './submit-button'
import { formatYearMonth } from '../utils/date-format'

type ProductType = 'petrol' | 'diesel' | 'both'

const productOptions: { value: ProductType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'both', label: 'Both' },
]

const inputClass =
  'mt-1.5 h-11 w-full rounded-md border border-white/10 bg-[#0b0f15] px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10'

const labelClass = 'text-xs font-medium tracking-tight text-slate-300'
const STORAGE_KEY = 'vat-invoice-form-state'

type Customer = {
  id: string
  customer_name: string
  address: string
  tin_number: string | null
  vat_number: string | null
}

type SavedFormState = {
  invoiceNumber: string
  invoiceDate: string
  buyerName: string
  buyerTinNo: string
  buyerVatNumber: string
  buyerAddress: string
  selectedProduct: ProductType
  petrolPrice: number
  petrolAmount: number
  dieselPrice: number
  dieselAmount: number
}

function getDefaultInvoicePrefix(): string {
  return `${formatYearMonth(new Date())}_LAKE_00`
}

function getDefaultState(): SavedFormState {
  return {
    invoiceNumber: getDefaultInvoicePrefix(),
    invoiceDate: new Date().toISOString().split('T')[0],
    buyerName: '',
    buyerTinNo: '',
    buyerVatNumber: '',
    buyerAddress: '',
    selectedProduct: 'petrol',
    petrolPrice: 0,
    petrolAmount: 0,
    dieselPrice: 0,
    dieselAmount: 0,
  }
}

function getInitialState(searchParams: URLSearchParams | null): SavedFormState {
  const defaultState = getDefaultState()
  const params = searchParams ?? new URLSearchParams()

  // 1. Prioritize URL Search Params
  if (params.toString()) {
    const productTypeFromUrl = params.get('product_type')
    const selectedProduct =
      productTypeFromUrl === 'petrol' || productTypeFromUrl === 'diesel' || productTypeFromUrl === 'both'
        ? productTypeFromUrl
        : defaultState.selectedProduct

    const petrolPrice = Number(params.get('petrol_unit_price') ?? '0')
    const petrolQuantity = Number(params.get('petrol_quantity') ?? '0')
    const dieselPrice = Number(params.get('diesel_unit_price') ?? '0')
    const dieselQuantity = Number(params.get('diesel_quantity') ?? '0')

    return {
      invoiceNumber: params.get('invoice_number') ?? defaultState.invoiceNumber,
      invoiceDate: params.get('invoice_date') ?? defaultState.invoiceDate,
      buyerName: params.get('buyer_name') ?? defaultState.buyerName,
      buyerTinNo: params.get('buyer_tin_no') ?? defaultState.buyerTinNo,
      buyerVatNumber: params.get('buyer_vat_number') ?? defaultState.buyerVatNumber,
      buyerAddress: params.get('buyer_address') ?? defaultState.buyerAddress,
      selectedProduct,
      petrolPrice,
      petrolAmount: Number(
        params.get('petrol_total_amount') ?? String(petrolPrice * petrolQuantity)
      ),
      dieselPrice,
      dieselAmount: Number(
        params.get('diesel_total_amount') ?? String(dieselPrice * dieselQuantity)
      ),
    }
  }

  // 2. Read from sessionStorage on the client side during lazy initialization
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<SavedFormState> & {
          petrolQty?: number
          dieselQty?: number
        }
        const {
          petrolQty: savedPetrolQty,
          dieselQty: savedDieselQty,
          ...savedState
        } = parsed

        return {
          ...defaultState,
          ...savedState,
          petrolAmount:
            savedState.petrolAmount ??
            (savedState.petrolPrice ?? 0) * (savedPetrolQty ?? 0),
          dieselAmount:
            savedState.dieselAmount ??
            (savedState.dieselPrice ?? 0) * (savedDieselQty ?? 0),
        }
      } catch {
        // Fallback to default state on parse error
      }
    }
  }

  return defaultState
}

export default function VatInvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Lazy state initialization runs synchronously before first render
  const [formState, setFormState] = useState<SavedFormState>(() =>
    getInitialState(searchParams)
  )

  const supabase = useMemo(() => createClient(), [])

  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customerError, setCustomerError] = useState('')

  // Persist state changes to sessionStorage (external system sync)
  useEffect(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formState))
    async function loadCustomers() {
      setCustomersLoading(true)
      setCustomerError('')

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setCustomerError('Please log in to load your customers.')
        setCustomersLoading(false)
        return
      }

      const { data: station, error: stationError } = await supabase
        .from('fuel_stations')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (stationError || !station) {
        setCustomerError('Unable to find your registered station.')
        setCustomersLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('customers')
        .select('id, customer_name, address, tin_number, vat_number')
        .eq('station_id', station.id)
        .order('customer_name')

      if (error) {
        setCustomerError(error.message)
      } else {
        setCustomers(data ?? [])
      }

      setCustomersLoading(false)
    }

    loadCustomers()
  }, [formState, supabase])

  const showPetrol = formState.selectedProduct === 'petrol' || formState.selectedProduct === 'both'
  const showDiesel = formState.selectedProduct === 'diesel' || formState.selectedProduct === 'both'

  const handleProductTypeChange = (type: ProductType) => {
    setFormState((previous) => {
      const nextState = {
        ...previous,
        selectedProduct: type,
      }

      if (type === 'petrol') {
        return {
          ...nextState,
          dieselPrice: 0,
          dieselAmount: 0,
        }
      }

      if (type === 'diesel') {
        return {
          ...nextState,
          petrolPrice: 0,
          petrolAmount: 0,
        }
      }

      return nextState
    })
  }

  const { subtotal, vatAmount, total } = useMemo(() => {
    const petrolTotal = showPetrol ? formState.petrolAmount : 0
    const dieselTotal = showDiesel ? formState.dieselAmount : 0
    const subtotal = ((petrolTotal + dieselTotal) / 118) * 100
    const vatAmount = subtotal * 0.18

    return {
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
    }
  }, [
    showPetrol,
    showDiesel,
    formState.petrolAmount,
    formState.dieselAmount,
  ])

  const money = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.reportValidity()) return

    const formData = new FormData(form)
    const params = new URLSearchParams()

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.trim() !== '') {
        params.set(key, value)
      }
    }

    router.push(`/invoice/preview?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-slate-100 antialiased pb-24 sm:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080b10]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:h-16">
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-wider text-white sm:text-base">
              VAT Invoice
            </h1>
            <p className="text-xs text-slate-500">
              Fuel tax invoice generator
            </p>
          </div>

          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-xs font-semibold text-emerald-200">
            Lakmini Enterprises
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
        <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Section 01: Invoice Details */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0e1219] p-4 shadow-xs sm:p-6">
            <SectionHeader number="01" title="Invoice Details" />

            <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
              <div>
                <label htmlFor="invoice_number" className={labelClass}>
                  Invoice No <Required />
                </label>
                <input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  value={formState.invoiceNumber}
                  onChange={(e) =>
                    setFormState((previous) => ({
                      ...previous,
                      invoiceNumber: e.target.value,
                    }))
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="invoice_date" className={labelClass}>
                  Invoice Date <Required />
                </label>
                <input
                  type="date"
                  id="invoice_date"
                  name="invoice_date"
                  value={formState.invoiceDate}
                  onChange={(e) =>
                    setFormState((previous) => ({
                      ...previous,
                      invoiceDate: e.target.value,
                    }))
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Fuel Selection <Required />
                </label>

                <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md border border-white/[0.06] bg-[#090d12] p-1">
                  {productOptions.map((option) => {
                    const active = formState.selectedProduct === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleProductTypeChange(option.value)}
                        className={`h-9 rounded text-xs font-semibold transition ${active
                          ? 'bg-emerald-300 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>

                <input
                  type="hidden"
                  name="product_type"
                  value={formState.selectedProduct}
                />
              </div>
            </div>
          </section>

          {/* Section 02: Buyer Details */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0e1219] p-4 shadow-xs sm:p-6">
            <SectionHeader number="02" title="Buyer Information" />

            <div className="space-y-3.5 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Select Existing Customer
                </label>

                <select
                  value={selectedCustomerId}
                  disabled={customersLoading}
                  onChange={(e) => {
                    const customerId = e.target.value

                    setSelectedCustomerId(customerId)

                    const customer = customers.find(
                      (item) => item.id === customerId
                    )

                    if (customer) {
                      setFormState((previous) => ({
                        ...previous,
                        buyerName: customer.customer_name,
                        buyerAddress: customer.address,
                        buyerTinNo: customer.tin_number ?? '',
                        buyerVatNumber: customer.vat_number ?? '',
                      }))
                    }
                  }}
                  className={inputClass}
                >
                  <option value="">
                    {customersLoading
                      ? 'Loading customers...'
                      : 'Enter buyer manually / Select customer'}
                  </option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_name}
                    </option>
                  ))}
                </select>

                {customerError && (
                  <p className="mt-2 text-xs text-red-600">
                    {customerError}
                  </p>
                )}

                <p className="mt-1.5 text-xs text-slate-500">
                  Select a saved customer to automatically fill in their details.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="buyer_name" className={labelClass}>
                  Buyer / Company Name <Required />
                </label>
                <input
                  type="text"
                  id="buyer_name"
                  name="buyer_name"
                  value={formState.buyerName}
                  onChange={(e) =>
                    setFormState((previous) => ({
                      ...previous,
                      buyerName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Acme Lanka Pvt Ltd"
                  autoComplete="organization"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="buyer_tin_no" className={labelClass}>
                  TIN Number <Required />
                </label>
                <input
                  type="text"
                  id="buyer_tin_no"
                  name="buyer_tin_no"
                  value={formState.buyerTinNo}
                  onChange={(e) =>
                    setFormState((previous) => ({
                      ...previous,
                      buyerTinNo: e.target.value,
                    }))
                  }
                  placeholder="10-digit TIN"
                  inputMode="numeric"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="buyer_vat_number" className={labelClass}>
                  VAT Registration No. <Required />
                </label>
                <input
                  type="text"
                  id="buyer_vat_number"
                  name="buyer_vat_number"
                  value={formState.buyerVatNumber}
                  onChange={(e) =>
                    setFormState((previous) => ({
                      ...previous,
                      buyerVatNumber: e.target.value,
                    }))
                  }
                  placeholder="VAT reg number"
                  required
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="buyer_address" className={labelClass}>
                  Billing Address <Required />
                </label>
                <textarea
                  id="buyer_address"
                  name="buyer_address"
                  rows={2}
                  value={formState.buyerAddress}
                  onChange={(e) =>
                    setFormState((previous) => ({
                      ...previous,
                      buyerAddress: e.target.value,
                    }))
                  }
                  placeholder="Street address, city"
                  autoComplete="street-address"
                  required
                  className="mt-1.5 w-full resize-none rounded-md border border-white/10 bg-[#0b0f15] p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
                />
              </div>
            </div>
          </section>

          {/* Section 03: Fuel Rates & Amounts */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0e1219] p-4 shadow-xs sm:p-6">
            <SectionHeader number="03" title="Fuel Rates & Amounts" />

            <div className="space-y-3.5">
              {showPetrol && (
                <FuelCard
                  title="Petrol"
                  priceName="petrol_unit_price"
                  amountName="petrol_total_amount"
                  quantityName="petrol_quantity"
                  priceValue={formState.petrolPrice}
                  amountValue={formState.petrolAmount}
                  quantityValue={
                    formState.petrolPrice > 0
                      ? formState.petrolAmount / formState.petrolPrice
                      : 0
                  }
                  onPriceChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      petrolPrice: value,
                    }))
                  }
                  onAmountChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      petrolAmount: value,
                    }))
                  }
                />
              )}

              {showDiesel && (
                <FuelCard
                  title="Diesel"
                  priceName="diesel_unit_price"
                  amountName="diesel_total_amount"
                  quantityName="diesel_quantity"
                  priceValue={formState.dieselPrice}
                  amountValue={formState.dieselAmount}
                  quantityValue={
                    formState.dieselPrice > 0
                      ? formState.dieselAmount / formState.dieselPrice
                      : 0
                  }
                  onPriceChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      dieselPrice: value,
                    }))
                  }
                  onAmountChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      dieselAmount: value,
                    }))
                  }
                />
              )}
            </div>
          </section>

          {/* Summary Box */}
          <section className="rounded-2xl border border-emerald-300/15 bg-[#111a1b] p-4 text-white shadow-md sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  Tax Summary
                </h2>
                <p className="text-xs text-slate-400">
                  Standard VAT Rate Applied
                </p>
              </div>

              <span className="rounded bg-emerald-300/10 px-2 py-1 font-mono text-xs font-medium text-emerald-200">
                18% VAT
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">
                  {money(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>VAT (18%)</span>
                <span className="font-mono text-slate-200">
                  {money(vatAmount)}
                </span>
              </div>

              <div className="flex items-end justify-between border-t border-white/10 pt-3">
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Total Payable
                </span>
                <span className="text-2xl font-bold font-mono tracking-tight text-white sm:text-3xl">
                  {money(total)}
                </span>
              </div>
            </div>
          </section>

          {/* Desktop submit button */}
          <div className="hidden sm:block pt-2">
            <SubmitButton />
          </div>
        </form>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080b10]/95 p-3 shadow-lg backdrop-blur-md sm:hidden">
        <div className="mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Amount
            </p>
            <p className="font-mono text-lg font-bold tracking-tight text-white">
              {money(total)}
            </p>
          </div>

          <div className="w-1/2">
            <SubmitButton form="invoice-form" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  number,
  title,
}: {
  number: string
  title: string
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-300 text-[11px] font-mono font-bold text-slate-950">
        {number}
      </span>

      <h2 className="text-sm font-bold tracking-tight text-white uppercase">
        {title}
      </h2>
    </div>
  )
}

function Required() {
  return <span className="font-bold text-emerald-300">*</span>
}

function FuelCard({
  title,
  priceName,
  amountName,
  quantityName,
  priceValue,
  amountValue,
  quantityValue,
  onPriceChange,
  onAmountChange,
}: {
  title: string
  priceName: string
  amountName: string
  quantityName: string
  priceValue: number
  amountValue: number
  quantityValue: number
  onPriceChange: (value: number) => void
  onAmountChange: (value: number) => void
}) {
  const lineSubtotal = amountValue

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          {title}
        </h3>

        {lineSubtotal > 0 && (
          <span className="font-mono text-xs font-semibold text-emerald-200">
            {lineSubtotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-3 grid-cols-2">
        <div>
          <label htmlFor={priceName} className={labelClass}>
            Unit Price <Required />
          </label>

          <div className="relative mt-1">
            <input
              type="number"
              step="0.01"
              min="0.01"
              id={priceName}
              name={priceName}
              placeholder="0.00"
              inputMode="decimal"
              required
              value={priceValue || ''}
              onChange={(e) =>
                onPriceChange(parseFloat(e.target.value) || 0)
              }
              className="h-10 w-full rounded-md border border-white/10 bg-[#0b0f15] pr-8 pl-3 text-right font-mono text-sm text-slate-100 outline-none transition focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
              /L
            </span>
          </div>
        </div>

        <div>
          <label htmlFor={amountName} className={labelClass}>
            Total Amount <Required />
          </label>

          <div className="relative mt-1">
            <input
              type="number"
              step="0.01"
              min="0.01"
              id={amountName}
              name={amountName}
              placeholder="0.00"
              inputMode="decimal"
              required
              value={amountValue || ''}
              onChange={(e) =>
                onAmountChange(parseFloat(e.target.value) || 0)
              }
              className="h-10 w-full rounded-md border border-white/10 bg-[#0b0f15] pr-10 pl-3 text-right font-mono text-sm text-slate-100 outline-none transition focus:border-emerald-300/50 focus:ring-2 focus:ring-emerald-300/10"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
              Rs.
            </span>
          </div>
        </div>
      </div>

      <input type="hidden" name={quantityName} value={quantityValue} />
      <p className="mt-2 text-right text-xs text-slate-500">
        Calculated quantity:{' '}
        {quantityValue.toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })}{' '}
        L
      </p>
    </div>
  )
}