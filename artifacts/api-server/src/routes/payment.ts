import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import { VerifyPaymentBody, VerifyPaymentResponse } from "@workspace/api-zod";
import { sendAdminNotification, sendClientReceipt } from "../lib/mailer";
import { logger } from "../lib/logger";

function sanitize(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.replace(/[<>]/g, "").trim().slice(0, 200);
}

const router: IRouter = Router();

// POST /payment/verify — client submits UTR after paying via UPI
router.post("/payment/verify", async (req, res): Promise<void> => {
  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { appointmentId, transactionId } = parsed.data;

  const [existing] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, appointmentId));

  if (!existing) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [updated] = await db
    .update(appointmentsTable)
    .set({
      status: "paid",
      transactionId: sanitize(transactionId),
      paidAt: new Date(),
    })
    .where(eq(appointmentsTable.id, appointmentId))
    .returning();

  // Fire-and-forget emails — failures must not block the user
  try {
    await sendAdminNotification(updated);
    await sendClientReceipt(updated);
  } catch (err) {
    logger.error({ err }, "Email sending failed");
  }

  const apiRow = {
    id: updated.id,
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.phone,
    dob: updated.dob,
    timeOfBirth: updated.timeOfBirth,
    placeOfBirth: updated.placeOfBirth,
    gender: updated.gender,
    consultationType: updated.consultationType,
    appointmentDate: updated.appointmentDate,
    appointmentTime: updated.appointmentTime,
    notes: updated.notes,
    amount: updated.amount,
    status: updated.status,
    transactionId: updated.transactionId ?? null,
    paidAt: updated.paidAt ? updated.paidAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
  };

  res.json(VerifyPaymentResponse.parse({ appointment: apiRow }));
});

export default router;
