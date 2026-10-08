
import { toWords } from 'number-to-words';

export function formatLKRInWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) {
    return 'RUPEES ZERO ONLY'
  }

  const roundedAmount = Math.round(amount * 100) / 100
  const rupees = Math.floor(roundedAmount)
  const cents = Math.round((roundedAmount - rupees) * 100)

  const rupeesText = toWords(rupees).toUpperCase()

  if (cents > 0) {
    const centsText = toWords(cents).toUpperCase()
    return `${rupeesText} AND ${centsText} CENTS ONLY`
  }

  return `${rupeesText} ONLY`
}