/** ₹ amount from paise: 25000 → "₹250", 12550 → "₹125.50". */
export function inr(paise: number): string {
  const rupees = paise / 100;
  return (
    '₹' +
    rupees.toLocaleString('en-IN', {
      minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Decimal string for structured data and feeds: 25000 → "250.00". */
export const amount = (paise: number) => (paise / 100).toFixed(2);
