import { Suspense } from 'react'
import VatInvoiceForm from './components/vat-form'

// type Props = {}

function InvoiceForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VatInvoiceForm />
    </Suspense>
  )
}

export default InvoiceForm