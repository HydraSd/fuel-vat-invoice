import React from "react";
import { extendedAmount } from "../utils/extended";

type Props = {
  productType?: "petrol" | "diesel" | "both" | string;
  petrolUnitPrice?: number;
  petrolQuantity?: number;
  dieselUnitPrice?: number;
  dieselQuantity?: number;
};

type RowConfig = {
  name: string;
  quantity: number;
  unitPrice: number;
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #000",
  borderTop: "none",
  padding: "8px",
};

export default function TableRow({
  productType,
  petrolUnitPrice = 0,
  petrolQuantity = 0,
  dieselUnitPrice = 0,
  dieselQuantity = 0,
}: Props) {
  // 1. Determine which rows to render
  const rowsToRender: RowConfig[] = [];

  if (productType === "petrol" || productType === "both") {
    rowsToRender.push({
      name: "PETROL",
      quantity: petrolQuantity,
      unitPrice: petrolUnitPrice,
    });
  }

  if (productType === "diesel" || productType === "both") {
    rowsToRender.push({
      name: "DIESEL",
      quantity: dieselQuantity,
      unitPrice: dieselUnitPrice,
    });
  }

  // 2. Fallback empty row if no matching product type
  if (rowsToRender.length === 0) {
    return (
      <tr>
        <td style={{ ...cellStyle, textAlign: "center" }}>1</td>
        <td style={cellStyle}></td>
        <td style={{ ...cellStyle, textAlign: "center" }}></td>
        <td style={{ ...cellStyle, textAlign: "center" }}></td>
        <td style={{ ...cellStyle, textAlign: "right" }}></td>
        <td style={{ ...cellStyle, textAlign: "right" }}></td>
      </tr>
    );
  }

  // 3. Render table rows dynamically
  return (
    <>
      {rowsToRender.map((row, index) => {
        const total = row.quantity * row.unitPrice;
        const extended = extendedAmount(total, 0.18)
        return (
          <tr key={row.name}>
            <td style={{ ...cellStyle, textAlign: "center" }}>{index + 1}</td>
            <td style={cellStyle}>{row.name}</td>
            <td style={{ ...cellStyle, textAlign: "center" }}>
              {row.quantity.toFixed(2)}
            </td>
            <td style={{ ...cellStyle, textAlign: "center" }}>
              {row.unitPrice.toFixed(2)}
            </td>
            <td style={{ ...cellStyle, textAlign: "right" }}>
              {extended.toFixed(2)}
            </td>
            <td style={{ ...cellStyle, textAlign: "right" }}>
              {total.toFixed(2)}
            </td>
          </tr>
        );
      })}
    </>
  );
}