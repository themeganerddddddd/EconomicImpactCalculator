export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value || 0);
}

export function formatJobs(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value || 0);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(value || 0);
}

export function formatRange(low: number, mid: number, high: number, currency = true) {
  const fmt = currency ? formatCurrency : formatNumber;
  return `${fmt(low)} / ${fmt(mid)} / ${fmt(high)}`;
}
