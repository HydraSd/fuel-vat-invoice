'use server'

import { z } from 'zod'

const InvoiceSchema = z
  .object({
    invoice_number: z.string().min(2, 'Invoice number is required.'),
    invoice_date: z.string().min(1, 'Invoice date is required.'),
    buyer_name: z.string().min(2, 'Buyer name is required.'),
    buyer_address: z.string().min(5, 'Buyer address is required.'),
    buyer_tin_no: z.string().min(2, 'Buyer TIN is required.'),
    buyer_vat_number: z.string().min(2, 'Buyer VAT number is required.'),
    product_type: z.enum(['petrol', 'diesel', 'both']),
    petrol_unit_price: z.coerce.number().min(0, 'Petrol unit price must be 0 or more.').optional(),
    petrol_quantity: z.coerce.number().min(0, 'Petrol quantity must be 0 or more.').optional(),
    diesel_unit_price: z.coerce.number().min(0, 'Diesel unit price must be 0 or more.').optional(),
    diesel_quantity: z.coerce.number().min(0, 'Diesel quantity must be 0 or more.').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.product_type === 'petrol' || data.product_type === 'both') {
      if (data.petrol_unit_price === undefined || Number.isNaN(data.petrol_unit_price)) {
        ctx.addIssue({
          path: ['petrol_unit_price'],
          code: z.ZodIssueCode.custom,
          message: 'Petrol unit price is required.',
        })
      }

      if (data.petrol_quantity === undefined || Number.isNaN(data.petrol_quantity)) {
        ctx.addIssue({
          path: ['petrol_quantity'],
          code: z.ZodIssueCode.custom,
          message: 'Petrol quantity is required.',
        })
      }
    }

    if (data.product_type === 'diesel' || data.product_type === 'both') {
      if (data.diesel_unit_price === undefined || Number.isNaN(data.diesel_unit_price)) {
        ctx.addIssue({
          path: ['diesel_unit_price'],
          code: z.ZodIssueCode.custom,
          message: 'Diesel unit price is required.',
        })
      }

      if (data.diesel_quantity === undefined || Number.isNaN(data.diesel_quantity)) {
        ctx.addIssue({
          path: ['diesel_quantity'],
          code: z.ZodIssueCode.custom,
          message: 'Diesel quantity is required.',
        })
      }
    }
  })

type InvoiceField =
  |  'invoice_number'
  | 'invoice_date'
  | 'buyer_name'
  | 'buyer_address'
  | 'buyer_tin_no'
  | 'buyer_vat_number'
  | 'product_type'
  | 'petrol_unit_price'
  | 'petrol_quantity'
  | 'diesel_unit_price'
  | 'diesel_quantity'

export type FormState = {
  errors?: Partial<Record<InvoiceField, string[]>>
  message?: string
  success?: boolean
}

export async function CreateInvoice(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawData = {
    invoice_date: formData.get('invoice_date'),
    buyer_name: formData.get('buyer_name'),
    buyer_address: formData.get('buyer_address'),
    buyer_tin_no: formData.get('buyer_tin_no'),
    buyer_vat_number: formData.get('buyer_vat_number'),
    product_type: formData.get('product_type'),
    petrol_unit_price: formData.get('petrol_unit_price'),
    petrol_quantity: formData.get('petrol_quantity'),
    diesel_unit_price: formData.get('diesel_unit_price'),
    diesel_quantity: formData.get('diesel_quantity'),
  }

  const validatedFields = InvoiceSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to submit form. Please fix the errors below.',
      success: false,
    }
  }

  try {
    return {
      message: 'VAT invoice created successfully.',
      success: true,
    }
  } catch {
    return {
      message: 'An error occurred while submitting the form. Please try again.',
      success: false,
    }
  }
}