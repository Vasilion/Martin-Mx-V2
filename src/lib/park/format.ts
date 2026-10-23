/** Formatting helpers that never depend on the server's time zone. */

/** "14:00" -> "2PM", "14:30" -> "2:30PM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

/** Plain text, for emails and Stripe. */
export function formatTimeRangeText(start: string, end: string) {
  return `${formatTime(start)}–${formatTime(end)}`;
}

/** For pages: word joiners keep "10AM–3PM" on one line (browsers otherwise break after the dash on phones). */
export function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)}⁠–⁠${formatTime(end)}`;
}

/** Calendar date treated as a plain date (noon UTC avoids off-by-one in any zone). */
function asDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`);
}

export function formatDay(isoDate: string, style: "short" | "long" = "short") {
  return asDate(isoDate).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
  });
}

export function weekdayOf(isoDate: string, style: "short" | "long" = "short") {
  return asDate(isoDate).toLocaleDateString("en-US", { timeZone: "UTC", weekday: style });
}

export function monthDay(isoDate: string) {
  const d = asDate(isoDate);
  return {
    month: d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" }),
    day: d.getUTCDate(),
  };
}

export function formatPrice(amount: number) {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}
