 export function extendedAmount(value:number, vatRate?: number) {
    const t = vatRate ? (vatRate*100) + 100 : 1
    const result = value/t *100

    return result
  }