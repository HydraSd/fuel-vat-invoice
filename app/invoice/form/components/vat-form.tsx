'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { SubmitButton } from './submit-button'

type ProductType = 'petrol' | 'diesel' | 'both'

const productOptions: { value: ProductType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'both', label: 'Both' },
]

const inputClass =
  'mt-1.5 h-11 w-full rounded-md border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10'

const labelClass = 'text-xs font-medium tracking-tight text-zinc-700'
const STORAGE_KEY = 'vat-invoice-form-state'

type SavedFormState = {
  invoiceNumber: string
  invoiceDate: string
  buyerName: string
  buyerTinNo: string
  buyerVatNumber: string
  buyerAddress: string
  selectedProduct: ProductType
  petrolPrice: number
  petrolQty: number
  dieselPrice: number
  dieselQty: number
}

function getDefaultState(): SavedFormState {
  return {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    buyerName: '',
    buyerTinNo: '',
    buyerVatNumber: '',
    buyerAddress: '',
    selectedProduct: 'petrol',
    petrolPrice: 0,
    petrolQty: 0,
    dieselPrice: 0,
    dieselQty: 0,
  }
}

function getInitialState(searchParams: URLSearchParams | null): SavedFormState {
  const defaultState = getDefaultState()
  const params = searchParams ?? new URLSearchParams()
  const productTypeFromUrl = params.get('product_type')
  const selectedProduct =
    productTypeFromUrl === 'petrol' || productTypeFromUrl === 'diesel' || productTypeFromUrl === 'both'
      ? productTypeFromUrl
      : defaultState.selectedProduct

  return {
    invoiceNumber: params.get('invoice_number') ?? defaultState.invoiceNumber,
    invoiceDate: params.get('invoice_date') ?? defaultState.invoiceDate,
    buyerName: params.get('buyer_name') ?? defaultState.buyerName,
    buyerTinNo: params.get('buyer_tin_no') ?? defaultState.buyerTinNo,
    buyerVatNumber: params.get('buyer_vat_number') ?? defaultState.buyerVatNumber,
    buyerAddress: params.get('buyer_address') ?? defaultState.buyerAddress,
    selectedProduct,
    petrolPrice: Number(params.get('petrol_unit_price') ?? '0'),
    petrolQty: Number(params.get('petrol_quantity') ?? '0'),
    dieselPrice: Number(params.get('diesel_unit_price') ?? '0'),
    dieselQty: Number(params.get('diesel_quantity') ?? '0'),
  }
}

export default function VatInvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formState, setFormState] = useState<SavedFormState>(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (params.toString()) {
      return getInitialState(params)
    }

    if (typeof window === 'undefined') {
      return getInitialState(null)
    }

    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return getInitialState(null)
    }

    try {
      const parsed = JSON.parse(saved) as Partial<SavedFormState>
      return {
        ...getDefaultState(),
        ...parsed,
      }
    } catch {
      return getInitialState(null)
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formState))
  }, [formState])

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
          dieselQty: 0,
        }
      }

      if (type === 'diesel') {
        return {
          ...nextState,
          petrolPrice: 0,
          petrolQty: 0,
        }
      }

      return nextState
    })
  }

  const { subtotal, vatAmount, total } = useMemo(() => {
    const petrolTotal = showPetrol ? formState.petrolPrice * formState.petrolQty : 0
    const dieselTotal = showDiesel ? formState.dieselPrice * formState.dieselQty : 0
    const subtotal = (petrolTotal + dieselTotal)/118 * 100
    const vatAmount = subtotal * 0.18

    return {
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
    }
  }, [
    showPetrol,
    showDiesel,
    formState.petrolPrice,
    formState.petrolQty,
    formState.dieselPrice,
    formState.dieselQty,
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
    <div className="min-h-screen bg-white text-zinc-950 antialiased pb-24 sm:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:h-16">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-950 sm:text-base">
              VAT Invoice
            </h1>
            <p className="text-xs text-zinc-500">
              Fuel tax invoice generator
            </p>
          </div>

          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-800">
            Lakmini Enterprises
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 sm:py-6">
        <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Section 01: Invoice Details */}
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs sm:p-6">
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

                <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md bg-zinc-100 p-1">
                  {productOptions.map((option) => {
                    const active = formState.selectedProduct === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleProductTypeChange(option.value)}
                        className={`h-9 rounded text-xs font-semibold transition ${
                          active
                            ? 'bg-zinc-950 text-white shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
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
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs sm:p-6">
            <SectionHeader number="02" title="Buyer Information" />

            <div className="space-y-3.5 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
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
                  className="mt-1.5 w-full resize-none rounded-md border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                />
              </div>
            </div>
          </section>

          {/* Section 03: Fuel Quantities */}
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs sm:p-6">
            <SectionHeader number="03" title="Fuel Quantities & Rates" />

            <div className="space-y-3.5">
              {showPetrol && (
                <FuelCard
                  title="Petrol"
                  priceName="petrol_unit_price"
                  quantityName="petrol_quantity"
                  priceValue={formState.petrolPrice}
                  quantityValue={formState.petrolQty}
                  onPriceChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      petrolPrice: value,
                    }))
                  }
                  onQuantityChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      petrolQty: value,
                    }))
                  }
                />
              )}

              {showDiesel && (
                <FuelCard
                  title="Diesel"
                  priceName="diesel_unit_price"
                  quantityName="diesel_quantity"
                  priceValue={formState.dieselPrice}
                  quantityValue={formState.dieselQty}
                  onPriceChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      dieselPrice: value,
                    }))
                  }
                  onQuantityChange={(value) =>
                    setFormState((previous) => ({
                      ...previous,
                      dieselQty: value,
                    }))
                  }
                />
              )}
            </div>
          </section>

          {/* Summary Box */}
          <section className="rounded-lg bg-zinc-950 p-4 text-white shadow-md sm:p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold tracking-wide uppercase">
                  Tax Summary
                </h2>
                <p className="text-xs text-zinc-400">
                  Standard VAT Rate Applied
                </p>
              </div>

              <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-xs font-medium text-zinc-300">
                18% VAT
              </span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">
                  {money(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>VAT (18%)</span>
                <span className="font-mono text-zinc-200">
                  {money(vatAmount)}
                </span>
              </div>

              <div className="flex items-end justify-between border-t border-zinc-800 pt-3">
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-md p-3 shadow-lg sm:hidden">
        <div className="mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Total Amount
            </p>
            <p className="font-mono text-lg font-bold tracking-tight text-zinc-950">
              {money(total)}
            </p>
          </div>

          <div className="w-1/2">
            <SubmitButton form='invoice-form'/>
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
      <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-950 text-[11px] font-mono font-bold text-white">
        {number}
      </span>

      <h2 className="text-sm font-bold tracking-tight text-zinc-950 uppercase">
        {title}
      </h2>
    </div>
  )
}

function Required() {
  return <span className="text-zinc-950 font-bold">*</span>
}

function FuelCard({
  title,
  priceName,
  quantityName,
  priceValue,
  quantityValue,
  onPriceChange,
  onQuantityChange,
}: {
  title: string
  priceName: string
  quantityName: string
  priceValue: number
  quantityValue: number
  onPriceChange: (value: number) => void
  onQuantityChange: (value: number) => void
}) {
  const lineSubtotal = priceValue * quantityValue

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50/50 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
          {title}
        </h3>

        {lineSubtotal > 0 && (
          <span className="font-mono text-xs font-semibold text-zinc-900">
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
              min="0"
              id={priceName}
              name={priceName}
              placeholder="0.00"
              inputMode="decimal"
              required
              value={priceValue || ''}
              onChange={(e) =>
                onPriceChange(parseFloat(e.target.value) || 0)
              }
              className="h-10 w-full rounded-md border border-zinc-200 bg-white pr-8 pl-3 text-right font-mono text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
              /L
            </span>
          </div>
        </div>

        <div>
          <label htmlFor={quantityName} className={labelClass}>
            Quantity <Required />
          </label>

          <div className="relative mt-1">
            <input
              type="number"
              step="0.01"
              min="0"
              id={quantityName}
              name={quantityName}
              placeholder="0.00"
              inputMode="decimal"
              required
              value={quantityValue || ''}
              onChange={(e) =>
                onQuantityChange(parseFloat(e.target.value) || 0)
              }
              className="h-10 w-full rounded-md border border-zinc-200 bg-white pr-7 pl-3 text-right font-mono text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
              L
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}