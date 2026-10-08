
import Link from 'next/link'
import { formatLKRInWords } from './utils/currency-convertor'
import Image from 'next/image'
import PrintButton from './components/print-btn'
import { extendedAmount } from './utils/extended'

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

export default async function InvoicePreviewPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {}
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

  // Parameter extractions with defaults based on document
  
  const invoiceDate = getValue(params.invoice_date) || '-'
  const invoiceNumber = getValue(params.invoice_number) || '-'
  
  const buyerName = getValue(params.buyer_name) || '-'
  const buyerAddress = getValue(params.buyer_address) || '-'
  const buyerVat = getValue(params.buyer_vat_number) || '-'
  const buyerTin = getValue(params.buyer_tin_no) || '-'
  const productType = getValue(params.product_type) || 'petrol'

  const petrolUnitPrice = Number(getValue(params.petrol_unit_price) || 0)
  const petrolQuantity = Number(getValue(params.petrol_quantity) || 0)
  const dieselUnitPrice = Number(getValue(params.diesel_unit_price) || 0)
  const dieselQuantity = Number(getValue(params.diesel_quantity) || 0)

  const petrolTotal = petrolUnitPrice * petrolQuantity
  const dieselTotal = dieselUnitPrice * dieselQuantity
  
  // PDF calculates VAT at 18%
  const vatRate = 0.18
  const subtotalExcludingVat = extendedAmount(petrolTotal, vatRate) + extendedAmount(dieselTotal, vatRate)
  const vatAmount = subtotalExcludingVat * vatRate
  const grandTotal = subtotalExcludingVat + vatAmount


  const hasPetrol = productType === 'petrol' || productType === 'both'
  const hasDiesel = productType === 'diesel' || productType === 'both'

  const formatLKR = (amount: number) =>
    `Rs.${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Top Action Bar */}
      <div className="mx-auto mb-4 flex max-w-4xl justify-end">
        <Link
          href={backQuery.toString() ? `/invoice/form?${backQuery.toString()}` : '/invoice/form'}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to Form
        </Link>
      </div>

      {/* Invoice Document Sheet */}
      <div className="mx-auto max-w-4xl rounded-sm bg-white p-6 md:p-10 shadow-md ring-1 ring-slate-200 text-slate-800 text-sm">
        
        {/* Header Section */}
        <div className="grid grid-cols-2 gap-4 border-b pb-4 border-slate-300">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">LAKMINI ENTERPRISES</h1>
            <p className="text-xs font-semibold text-slate-700">SHELL FILLING STATION</p>
            <p className="text-xs text-slate-600">82, PASYALA - GIRIULLA ROAD,</p>
            <p className="text-xs text-slate-600">MIRIGAMA</p>
            <p className="text-xs text-slate-600">ACC No: 610141</p>
            <p className="text-xs text-slate-600">Tel: 0332 273 209 | Fax: 0332 273 209</p>
          </div>

          <div className="text-right">
            {/* <div className="inline-block rounded border border-red-500 p-1 mb-2 text-center">
              <span className="text-lg font-bold text-red-600 tracking-wider">Shell</span>
            </div> */}
            <div className='inline-block'>

            <Image
              src='/shell.png'
              width={100}
              height={100}
              alt='Shell'
              loading="lazy"
            />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900">TAX INVOICE</h2>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Date:</span> {invoiceDate}
            </p>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">INVOICE NUMBER:</span> {invoiceNumber}
            </p>
          </div>
        </div>

        {/* Seller & Buyer Information */}
        <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-300">
          {/* Seller Details */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-200 pb-1 mb-1">SELLER</h3>
            <p className="font-semibold text-slate-800">LAKMINI ENTERPRISES</p>
            <p className="text-xs text-slate-600">82, PASYALA ROAD, MIRIGAMA</p>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">VAT Reg No:</span> 934033728-7000
            </p>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">TIN No:</span> 934033728
            </p>
          </div>

          {/* Buyer Details */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-200 pb-1 mb-1">BUYER</h3>
            <p className="font-semibold text-slate-800">{buyerName}</p>
            <p className="text-xs text-slate-600">{buyerAddress}</p>
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
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase">
                <th className="border border-slate-300 px-2 py-2 text-center w-12">SN</th>
                <th className="border border-slate-300 px-3 py-2 text-left">DESCRIPTION</th>
                <th className="border border-slate-300 px-2 py-2 text-right">Qty. (L)</th>
                <th className="border border-slate-300 px-2 py-2 text-right">UNIT RATE (LKR/Ltr)</th>
                <th className="border border-slate-300 px-2 py-2 text-right">EXTENDED AMOUNT (LKR)</th>
                <th className="border border-slate-300 px-2 py-2 text-right">NET AMOUNT (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {hasPetrol && (
                <tr>
                  <td className="border border-slate-300 px-2 py-2 text-center">1</td>
                  <td className="border border-slate-300 px-3 py-2 font-semibold">PETROL</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{petrolQuantity.toFixed(2)}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{petrolUnitPrice > 0 ? petrolUnitPrice.toFixed(2) : ''}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{extendedAmount(petrolTotal, vatRate).toFixed(2)}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{petrolTotal.toFixed(2)}</td>
                </tr>
              )}
              {hasDiesel && (
                <tr>
                  <td className="border border-slate-300 px-2 py-2 text-center">{hasPetrol ? 2 : 1}</td>
                  <td className="border border-slate-300 px-3 py-2 font-semibold">DIESEL</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{dieselQuantity.toFixed(2)}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{dieselUnitPrice > 0 ? dieselUnitPrice.toFixed(2) : ''}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{extendedAmount(dieselTotal, vatRate).toFixed(2)}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right">{dieselTotal.toFixed(2)}</td>
                </tr>
              )}
              {!hasPetrol && !hasDiesel && (
                <tr>
                  <td colSpan={6} className="border border-slate-300 px-3 py-4 text-center text-slate-500">
                    No items selected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="mt-4 flex flex-col items-end text-xs">
          <div className="w-full max-w-xs space-y-1 border border-slate-300 p-2 bg-slate-50">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-700">EXCLUDING VAT</span>
              <span>{formatLKR(subtotalExcludingVat)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1">
              <span className="font-semibold text-slate-700">VAT (18%)</span>
              <span>{formatLKR(vatAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-1 font-bold text-slate-900 text-sm">
              <span>TOTAL</span>
              <span>{formatLKR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Total in words banner */}
        <div className="mt-3 border-t border-b border-slate-300 py-1 font-semibold uppercase text-xs text-slate-800">
          TOTAL IN LKR: {grandTotal === 0 ? 'ZERO RUPEES ONLY' : `${formatLKRInWords(grandTotal)} `}
        </div>

        {/* Footer: Bank Details & Stamp/Signature Block */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-xs pt-2">
          {/* Bank Details */}
          <div className="space-y-1">
            <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
              BANK DETAILS
            </h4>
            <p><span className="font-semibold">BANK NAME:</span> COMMERCIAL BANK OF CEYLON</p>
            <p><span className="font-semibold">BANK BRANCH:</span> MIRIGAMA BRANCH</p>
            <p><span className="font-semibold">ACCOUNT NUMBER:</span> 1000358108</p>
            <p><span className="font-semibold">ACCOUNT NAME:</span> LAKMINI ENTERPRISES</p>
            
            <div className="mt-3 text-[11px] text-slate-600">
              <p>For any concerns, contact 070 567 4240 / 076 689 1534</p>
              <p>Please WhatsApp your payment slip to 070 598 0294</p>
            </div>
          </div>

          {/* Signature / Stamp Block */}
          <div className="flex flex-col items-center justify-end">
            <div className="w-48 h-24 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs text-center p-2">
              Signature and Stamp
            </div>
          </div>
        </div>
            
      </div>
     
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