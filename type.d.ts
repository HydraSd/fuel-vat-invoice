type Invoice = {
  id?: string;
  customer_id?: string;

  invoice_number?: string;
  invoice_date?: string;

  buyer_name?: string;
  buyerAddress?: string;
  buyerVat?: string;
  buyerTin?: string;

  productType: "petrol" | "diesel" | "both";

  petrolUnitPrice?: number | null;
  petrolQuantity?: number | null;

  dieselUnitPrice?: number | null;
  dieselQuantity?: number | null;

  vatRate?: number;
  subtotal?: number;
  vatAmount?: number;
  grandTotal?: number;
};

type Customer = {
  id:string;
  name: string;
  address: string;
  tin_no: string;
  vat_no: string;
}