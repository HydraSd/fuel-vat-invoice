import Image from "next/image";
import TableRow from "./table-row";
import { extendedAmount } from "../utils/extended";
import { formatLKRInWords } from "../utils/currency-convertor";

const TaxInvoice = (data : Invoice) => {

  const extended = data.grandTotal ? extendedAmount(data.grandTotal, data.vatRate) : 0;
  const total = data.grandTotal ? data.grandTotal : 0;
  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        // maxWidth: "800px",
        // margin: "0 auto",
        padding: "24px",
        backgroundColor: "#fff",
        color: "#000",
        
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            LAKMINI ENTERPRISES
          </div>
          <div>SHELL FILLING STATION</div>
          <div>82, PASYALA - GIRIULLA ROAD,</div>
          <div>MIRIGAMA</div>
          <div>ACC No: 610141</div>
          <div>Tel: 0332 273 209</div>
          <div>Fax: 0332 273 209</div>
        </div>

        {/* Shell Logo */}
        <div style={{ textAlign: "right" }}>
          <Image
          src='/shell.png'
          width={100}
          height={100}
          alt="logo"
          />
        </div>
      </div>

      {/* Red line under header */}
      <div
        style={{
          height: "3px",
          backgroundColor: "#ED1C24",
          marginBottom: "12px",
        }}
      />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          letterSpacing: "1px",
          marginBottom: "12px",
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
          fontSize: "13px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px 10px",
                width: "50%",
              }}
            >
              <strong>Date:</strong> {data.invoice_date}
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px 10px",
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
          fontSize: "12px",
          marginBottom: "0",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "8px 10px",
                width: "50%",
                verticalAlign: "top",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
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
                padding: "8px 10px",
                width: "50%",
                verticalAlign: "top",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
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
          fontSize: "12px",
          marginBottom: "0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 8px",
                textAlign: "center",
                width: "50px",
              }}
            >
              SN
            </th>
            <th
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 8px",
                textAlign: "left",
              }}
            >
              DESCRIPTION
            </th>
            <th
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 8px",
                textAlign: "center",
                width: "80px",
              }}
            >
              Qty. (L)
            </th>
            <th
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 8px",
                textAlign: "center",
                width: "100px",
              }}
            >
              UNIT RATE
              <br />
              (LKR / Ltr)
            </th>
            <th
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 8px",
                textAlign: "center",
                width: "110px",
              }}
            >
              EXTENDED AMOUNT
              <br />
              (LKR)
            </th>
            <th
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 8px",
                textAlign: "center",
                width: "100px",
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
          fontSize: "12px",
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
                padding: "6px 10px",
                textAlign: "left",
              }}
            >
              EXCLUDING VAT
            </td>
            <td
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 10px",
                textAlign: "right",
                width: "100px",
              }}
            >
              LKR. {extended.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={5}
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 10px",
                textAlign: "left",
              }}
            >
              VAT ({data.vatRate ? data.vatRate*100 : '0'}%)
            </td>
            <td
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 10px",
                textAlign: "right",
              }}
            >
              LKR. {data.vatAmount ? data.vatAmount.toFixed(2) : '0.00'}
            </td>
          </tr>
          <tr>
            <td
              colSpan={5}
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 10px",
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
                padding: "6px 10px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              LKR. {data.grandTotal ? data.grandTotal.toFixed(2) : '0.00'}
            </td>
          </tr>
          <tr>
            <td
              colSpan={6}
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "6px 10px",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              TOTAL IN LKR: {total === 0 ? 'ZERO RUPEES ONLY' : `${formatLKRInWords(total)} `}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bank Details */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "12px",
          marginBottom: "0",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
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
                padding: "10px",
                lineHeight: "1.6",
              }}
            >
              <div>
                <strong>BANK NAME:</strong> COMMERCIAL BANK OF CEYLON
              </div>
              <div>
                <strong>BANK BRANCH:</strong> MIRIGAMA BRANCH
              </div>
              <div>
                <strong>ACCOUNT NUMBER:</strong> 1000358108
              </div>
              <div>
                <strong>ACCOUNT NAME:</strong> LAKMINI ENTERPRISES
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
          fontSize: "12px",
          marginBottom: "24px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                borderTop: "none",
                padding: "10px",
              }}
            >
              <div>
                For any concerns, contact 070 567 4240 / 076 689 1534
              </div>
              <div>Please WhatsApp your payment slip to, 070 598 0294</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature area */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          fontSize: "12px",
        }}
      >
        <div
          style={{
            fontFamily: "cursive, 'Segoe Script', 'Brush Script MT', serif",
            fontSize: "18px",
            marginBottom: "4px",
            minHeight: "40px",
          }}
        >
          {/* Placeholder for handwritten signature */}
          ________________________
        </div>
        <div style={{ fontSize: "11px", color: "#333" }}>
          Signature and Stamp
        </div>
      </div>
    </div>
  );
};

export default TaxInvoice;