/**
 * Format a number as Indonesian Rupiah, e.g. 125000 -> "Rp125.000".
 *
 * We use manual formatting instead of Intl.NumberFormat because Node.js
 * and browsers render id-ID currency differently (e.g. "Rp 350.000" vs
 * "Rp350.000"), which causes React hydration mismatches in Next.js SSR.
 */
export const formatRupiah = (value: number) => {
  const formatted = Math.abs(value)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return value < 0 ? `-Rp${formatted}` : `Rp${formatted}`;
};
