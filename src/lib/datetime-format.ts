export function formatDateMMDDYYYY(value: string | Date): string {
  if (value instanceof Date) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const year = String(value.getFullYear());
    return `${month}/${day}/${year}`;
  }
  const datePart = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
}

export function formatTimeEST(value: string): string {
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  const minute = Number(rawMinute ?? "0");
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return `${value} EST`;
  }
  const period = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(twelveHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period} EST`;
}

export function formatTimeRangeEST(startTime: string, endTime: string): string {
  return `${formatTimeEST(startTime)} - ${formatTimeEST(endTime)}`;
}
