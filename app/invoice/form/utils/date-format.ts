export function formatYearMonth(date: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    year: "2-digit",
    month: "short",
    timeZone: "Asia/Colombo",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  return `${year}${month}`.toUpperCase();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}