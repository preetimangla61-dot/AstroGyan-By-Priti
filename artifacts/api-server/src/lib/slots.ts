// Slot generation — computes bookable time slots for a given date and
// filters out any already taken (prevents double-booking).

import { db, appointmentsTable } from "@workspace/db";
import { and, eq, ne } from "drizzle-orm";

// Default availability config.  Can be extended to be DB-driven later.
const AVAILABILITY = {
  workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat (0 = Sun)
  startHour: 10,
  endHour: 18,
  slotMinutes: 60,
  blockedDates: [] as string[],
};

export const CONSULTATION_TYPES = [
  { id: "career", label: "Career", amount: 799 },
  { id: "marriage", label: "Marriage & Relationships", amount: 999 },
  { id: "health", label: "Health", amount: 799 },
  { id: "finance", label: "Finance", amount: 899 },
  { id: "general", label: "General Guidance", amount: 599 },
] as const;

export function getAmountForType(typeId: string): number {
  const found = CONSULTATION_TYPES.find((t) => t.id === typeId);
  return found ? found.amount : 599;
}

export async function getSlotsForDate(
  dateISO: string,
): Promise<{ time: string; available: boolean }[]> {
  const date = new Date(dateISO + "T00:00:00");
  const weekday = date.getDay();

  if (!AVAILABILITY.workingDays.includes(weekday)) return [];
  if (AVAILABILITY.blockedDates.includes(dateISO)) return [];

  // Fetch taken slots for this date from DB
  const taken = await db
    .select({ appointmentTime: appointmentsTable.appointmentTime })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.appointmentDate, dateISO),
        ne(appointmentsTable.status, "cancelled"),
      ),
    );
  const takenTimes = new Set(taken.map((r) => r.appointmentTime));

  const slots: { time: string; available: boolean }[] = [];
  for (
    let hour = AVAILABILITY.startHour;
    hour < AVAILABILITY.endHour;
    hour += AVAILABILITY.slotMinutes / 60
  ) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    slots.push({ time: label, available: !takenTimes.has(label) });
  }
  return slots;
}
