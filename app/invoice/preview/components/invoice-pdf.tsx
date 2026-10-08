import Image from "next/image";
import TableRow from "./table-row";
import { extendedAmount } from "../utils/extended";
import { currency, formatLKRInWords } from "../utils/currency-convertor";
import { formatDate } from "../../form/utils/date-format";

const TaxInvoice = (data: Invoice) => {
  const extended = data.grandTotal
    ? extendedAmount(data.grandTotal, data.vatRate)
    : 0;
  const total = data.grandTotal ? data.grandTotal : 0;
  const formatedDate =
    !data.invoice_date || data.invoice_date === "-"
      ? "-"
      : formatDate(new Date(data.invoice_date));

  return (
    <>
      {/* Print styles specifically tailored for A5 or Half-A4 sheet */}
      <style jsx global>{`
        @page {
          size: A5 portrait;
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          .invoice-container {
            width: 100% !important;
            max-width: 148mm !important;
            min-height: 210mm !important;
            box-shadow: none !important;
            padding: 12px !important;
          }
        }
      `}</style>

      <div
        className="invoice-container"
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          width: "100%",
          maxWidth: "148mm", /* A5 Width / Half-A4 */
          margin: "0 auto",
          padding: "12px",
          backgroundColor: "#fff",
          color: "#000",
          boxSizing: "border-box",
          fontSize: "10px",
          lineHeight: "1.2",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "4px",
          }}
        >
          <div style={{ fontSize: "10px", lineHeight: "1.3" }}>
            <div style={{ fontWeight: "bold", fontSize: "12px" }}>
              LAKMINI ENTERPRISES
            </div>
            <div>SHELL FILLING STATION</div>
            <div>82, PASYALA - GIRIULLA ROAD, MIRIGAMA</div>
            <div>ACC No: 610141 | Tel/Fax: 0332 273 209</div>
          </div>

          {/* Shell Logo */}
          <div style={{ textAlign: "right" }}>
            <Image
              src="/shell.png"
              width={65}
              height={65}
              alt="logo"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Red line under header */}
        <div
          style={{
            height: "2px",
            backgroundColor: "#ED1C24",
            marginBottom: "6px",
          }}
        />

        {/* Title */}
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "14px",
            letterSpacing: "0.5px",
            marginBottom: "6px",
          }}
        >
          TAX INVOICE
        </div>

        {/* Date & Invoice Number */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "0",
            fontSize: "10px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  width: "50%",
                }}
              >
                <strong>Date:</strong> {formatedDate}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  width: "50%",
                }}
              >
                <strong>INVOICE NUMBER:</strong> {data.invoice_number}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Seller & Buyer */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            marginBottom: "0",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 6px",
                  width: "50%",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                  SELLER
                </div>
                <div>LAKMINI ENTERPRISES</div>
                <div>82, PASYALA ROAD, MIRIGAMA</div>
                <div>VAT Reg No: 934033728 - 7000</div>
                <div>TIN No: 934033728</div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 6px",
                  width: "50%",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                  BUYER
                </div>
                <div>{data.buyer_name}</div>
                <div>{data.buyerAddress}</div>
                <div>VAT Reg No: {data.buyerVat}</div>
                <div>TIN No: {data.buyerTin}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            marginBottom: "0",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 4px",
                  textAlign: "center",
                  width: "30px",
                }}
              >
                SN
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 6px",
                  textAlign: "left",
                }}
              >
                DESCRIPTION
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 4px",
                  textAlign: "center",
                  width: "50px",
                }}
              >
                Qty. (L)
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 4px",
                  textAlign: "center",
                  width: "75px",
                }}
              >
                UNIT RATE
                <br />
                (LKR/L)
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 4px",
                  textAlign: "center",
                  width: "85px",
                }}
              >
                EXTENDED
                <br />
                (LKR)
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 4px",
                  textAlign: "center",
                  width: "90px",
                }}
              >
                NET AMOUNT
                <br />
                (LKR)
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRow
              productType={data.productType}
              petrolUnitPrice={data.petrolUnitPrice}
              petrolQuantity={data.petrolQuantity}
              dieselUnitPrice={data.dieselUnitPrice}
              dieselQuantity={data.dieselQuantity}
            />
          </tbody>
        </table>

        {/* Totals */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            marginBottom: "0",
          }}
        >
          <tbody>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "left",
                }}
              >
                EXCLUDING VAT
              </td>
              <td
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "right",
                  width: "90px",
                }}
              >
                LKR.{currency(extended)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "left",
                }}
              >
                VAT ({data.vatRate ? data.vatRate * 100 : "0"}%)
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "right",
                }}
              >
                LKR. {data.vatAmount ? currency(data.vatAmount) : "0.00"}
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                TOTAL
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                LKR. {data.grandTotal ? currency(data.grandTotal) : "0.00"}
              </td>
            </tr>
            <tr>
              <td
                colSpan={6}
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                TOTAL IN LKR:{" "}
                {total === 0
                  ? "ZERO RUPEES ONLY"
                  : `${formatLKRInWords(total)} `}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Bank Details */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            marginBottom: "0",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "3px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#f9f9f9",
                }}
              >
                BANK DETAILS
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 6px",
                  lineHeight: "1.3",
                }}
              >
                <div>
                  <strong>BANK NAME:</strong> COMMERCIAL BANK OF CEYLON
                </div>
                <div>
                  <strong>BANK BRANCH:</strong> MIRIGAMA BRANCH |{" "}
                  <strong>A/C NO:</strong> 1000358108
                </div>
                <div>
                  <strong>A/C NAME:</strong> LAKMINI ENTERPRISES
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Contact / Footer note */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "9px",
            marginBottom: "12px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #000",
                  borderTop: "none",
                  padding: "4px 6px",
                }}
              >
                <div>
                  For any concerns, contact 070 567 4240 / 076 689 1534 | WhatsApp payment slip to 070 598 0294
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature area */}
        <div
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontSize: "10px",
          }}
        >
          {/* <div
            style={{
              fontFamily: "cursive, 'Segoe Script', 'Brush Script MT', serif",
              fontSize: "14px",
              marginBottom: "2px",
              minHeight: "20px",
            }}
          >
            ________________________
          </div> */}
          {/* <div style={{ fontSize: "10px", color: "#333" }}>
            Signature and Stamp
          </div> */}
        </div>
      </div>
    </>
  );
};

export default TaxInvoice;