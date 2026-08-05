import { Router, type IRouter } from "express";
import { and, eq, ne } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import {
  CreateAppointmentBody,
  ListAppointmentsHeader,
  CreateAppointmentResponse,
  ListAppointmentsResponse,
} from "@workspace/api-zod";
import { getAmountForType } from "../../lib/slots";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,14}$/;

function sanitize(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.replace(/[<>]/g, "").trim().slice(0, 1000);
}

function isAdmin(code: string | undefined): boolean {
  const adminCode = process.env.ADMIN_ACCESS_CODE;
  return Boolean(adminCode) && code === adminCode;
}

const router: IRouter = Router();

// GET /appointments — admin only
router.get("/appointments", async (req, res): Promise<void> => {
  const header = ListAppointmentsHeader.safeParse(req.headers);
  if (!header.success || !isAdmin(header.data?.["x-admin-code"])) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const appointments = await db
    .select()
    .from(appointmentsTable)
    .orderBy(appointmentsTable.createdAt);

  // Map DB row shape to API response shape
  const mapped = appointments.map(toApiShape);
  res.json(ListAppointmentsResponse.parse({ appointments: mapped }));
});

// POST /appointments — create booking
router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: [parsed.error.message] });
    return;
  }

  const body = parsed.data;

  // Server-side validation
  const errors: string[] = [];
  if (!EMAIL_RE.test(body.email)) errors.push("Email is not valid");
  if (!PHONE_RE.test(body.phone.replace(/\s/g, "")))
    errors.push("Phone number is not valid");
  if (!body.fullName.trim()) errors.push("Full name is required");
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  // Re-check slot availability (race-condition guard)
  const conflict = await db
    .select({ id: appointmentsTable.id })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.appointmentDate, body.appointmentDate),
        eq(appointmentsTable.appointmentTime, body.appointmentTime),
        ne(appointmentsTable.status, "cancelled"),
      ),
    )
    .limit(1);

  if (conflict.length > 0) {
    res
      .status(409)
      .json({ errors: ["That time slot was just booked. Please pick another."] });
    return;
  }

  const id = crypto.randomUUID();
  const [row] = await db
    .insert(appointmentsTable)
    .values({
      id,
      fullName: sanitize(body.fullName),
      email: sanitize(body.email),
      phone: sanitize(body.phone),
      dob: sanitize(body.dob),
      timeOfBirth: sanitize(body.timeOfBirth),
      placeOfBirth: sanitize(body.placeOfBirth),
      gender: sanitize(body.gender),
      consultationType: sanitize(body.consultationType),
      appointmentDate: sanitize(body.appointmentDate),
      appointmentTime: sanitize(body.appointmentTime),
      notes: sanitize(body.notes ?? ""),
      amount: getAmountForType(body.consultationType),
      status: "pending_payment",
    })
    .returning();

  res.status(201).json(
    CreateAppointmentResponse.parse({ appointment: toApiShape(row) }),
  );
});

// Map DB row to camelCase API shape expected by the spec
function toApiShape(row: typeof appointmentsTable.$inferSelect) {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    dob: row.dob,
    timeOfBirth: row.timeOfBirth,
    placeOfBirth: row.placeOfBirth,
    gender: row.gender,
    consultationType: row.consultationType,
    appointmentDate: row.appointmentDate,
    appointmentTime: row.appointmentTime,
    notes: row.notes,
    amount: row.amount,
    status: row.status,
    transactionId: row.transactionId ?? null,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export { toApiShape };
export default router;
