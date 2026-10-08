'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Button } from '@/components/ui/button'
import TaxInvoice from './invoice-pdf'



export default function PrintButton(data: Invoice) {
const invoiceRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: 'Tax-Invoice-INV-20261004',
    pageStyle: `
      @page {
        size: A4;
        margin: 1mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  })
  return (
    <div>
        <div className="hidden">
        <div ref={invoiceRef}>
          <TaxInvoice 
            invoice_number={data.invoice_number}
            invoice_date={data.invoice_date}
            buyer_name={data.buyer_name}
            buyerAddress={data.buyerAddress}
            buyerVat={data.buyerVat}
            buyerTin={data.buyerTin}
            productType={data.productType}
            petrolUnitPrice={data.petrolUnitPrice}
            petrolQuantity={data.petrolQuantity}
            dieselUnitPrice={data.dieselUnitPrice}
            dieselQuantity={data.dieselQuantity}
            vatRate={data.vatRate}
            vatAmount={data.vatAmount}
            grandTotal={data.grandTotal}
          />
        </div>
      </div>
    <Button
      type="button"
      onClick={handlePrint}
      className="w-full h-12 text-lg mt-5 print:hidden"
    >
      Print
    </Button>
    </div>
  )
}