import "server-only";
import { getPractice, getSchedule, parkNow, type Practice, type RideDay } from "@/lib/park/live";
import { getStore } from "@/lib/registrations/store";

export type OpenDayWithSpots = RideDay & { spotsLeft: Record<string, number> };

/** A ride day takes registrations while it's open, not cancelled, and hasn't ended. */
export function isRegistrable(day: RideDay, now = new Date()) {
  const { date, time } = parkNow(now);
  return day.registrationOpen && !day.cancelled && (day.date > date || (day.date === date && day.end > time));
}

export function priceFor(practice: Practice, classId: string) {
  const cls = practice.classes.find((c) => c.id === classId);
  if (!cls) return null;
  return { cls, amount: cls.track === "main" ? practice.prices.main : practice.prices.junior };
}

/**
 * Can a rider sign up for practice online right now? Needs the site-wide switch on
 * and at least one open ride day. Drives every Register button on the site.
 */
export async function practiceRegistrationOpen() {
  const [schedule, practice] = await Promise.all([getSchedule(), getPractice()]);
  return practice.registrationEnabled && schedule.some((d) => isRegistrable(d));
}

/** Open ride days with live spots left per class (capacity minus pending holds and paid). */
export async function getOpenDays(): Promise<{ days: OpenDayWithSpots[]; practice: Practice }> {
  const [schedule, practice] = await Promise.all([getSchedule(), getPractice()]);
  const open = practice.registrationEnabled ? schedule.filter((d) => isRegistrable(d)) : [];
  const store = getStore();
  const days = await Promise.all(
    open.map(async (d) => {
      const taken = await store.spotsTaken(d.date);
      const spotsLeft = Object.fromEntries(
        practice.classes.map((c) => [c.id, Math.max(0, practice.defaultCapacity - (taken[c.id] ?? 0))]),
      );
      return { ...d, spotsLeft };
    }),
  );
  return { days, practice };
}
