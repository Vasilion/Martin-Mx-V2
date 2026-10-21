import "server-only";
import { getPractice, getSchedule, parkNow, type RideDay } from "@/lib/park/live";
import { getStore } from "@/lib/registrations/store";

export type RosterRider = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  riderNumber: string;
  classId: string;
  classLabel: string;
  bikeSize: number;
  ageGroup: "adult" | "minor";
  email: string;
  phone: string;
  amount: number;
  checkedIn: boolean;
  paidAt?: string;
};

export type ClassCount = { id: string; label: string; paid: number; held: number; capacity: number };

/** Paid riders for a day plus per-class counts. Pending checkouts count as held spots only. */
export async function getRoster(date: string) {
  const [regs, practice] = await Promise.all([getStore().listByDay(date), getPractice()]);
  const label = (id: string) => practice.classes.find((c) => c.id === id)?.label ?? id;
  const riders: RosterRider[] = regs
    .filter((r) => r.status === "paid")
    .map((r) => ({
      id: r.id,
      name: `${r.firstName} ${r.lastName}`,
      firstName: r.firstName,
      lastName: r.lastName,
      riderNumber: r.riderNumber,
      classId: r.classId,
      classLabel: label(r.classId),
      bikeSize: r.bikeSize,
      ageGroup: r.ageGroup,
      email: r.email,
      phone: r.phone,
      amount: r.amount,
      checkedIn: !!r.checkedIn,
      paidAt: r.paidAt,
    }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
  const classes: ClassCount[] = practice.classes.map((c) => ({
    id: c.id,
    label: c.label,
    paid: riders.filter((r) => r.classId === c.id).length,
    held: regs.filter((r) => r.status === "pending" && r.classId === c.id).length,
    capacity: practice.defaultCapacity,
  }));
  return { riders, classes, revenue: riders.reduce((s, r) => s + r.amount, 0) };
}

/** Today's ride day if there is one, else the next scheduled one. */
export async function getFocusDay(): Promise<{ day: RideDay | null; isToday: boolean; today: string }> {
  const schedule = await getSchedule();
  const { date: today } = parkNow();
  const day = schedule.find((d) => d.date === today) ?? schedule.find((d) => d.date > today) ?? null;
  return { day, isToday: day?.date === today, today };
}
