type Invoice = {
  invoice_number ?: string;
  invoice_date ?: string;
  buyer_name ?: string;
  buyerAddress ?: string;
  buyerVat ?: string;
  buyerTin ?: string;
  productType ?: string;
  petrolUnitPrice ?: number;
  petrolQuantity ?: number;
  dieselUnitPrice ?: number;
  dieselQuantity ?: number;
  vatRate ?: number;
  vatAmount ?: number;
  grandTotal ?: number
}