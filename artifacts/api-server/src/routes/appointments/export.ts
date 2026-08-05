import { Router, type IRouter } from "express";
import { db, appointmentsTable } from "@workspace/db";
import { logger } from "../../lib/logger";

function isAdmin(code: string | undefined): boolean {
  const adminCode = process.env.ADMIN_ACCESS_CODE;
  return Boolean(adminCode) && code === adminCode;
}

function toCsvValue(v: unknown): string {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

const router: IRouter = Router();

// GET /appointments/export?code=<admin_code>
// Also accepts x-admin-code header for symmetry with other admin routes.
router.get("/appointments/export", async (req, res): Promise<void> => {
  const code =
    (req.headers["x-admin-code"] as string | undefined) ??
    (req.query.code as string | undefined);

  if (!isAdmin(code)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const appointments = await db
    .select()
    .from(appointmentsTable)
    .orderBy(appointmentsTable.createdAt);

  const columns = [
    "id",
    "fullName",
    "email",
    "phone",
    "consultationType",
    "appointmentDate",
    "appointmentTime",
    "amount",
    "status",
    "transactionId",
    "createdAt",
  ] as const;

  const rows: string[] = [columns.join(",")];
  for (const a of appointments) {
    const apiRow = {
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      phone: a.phone,
      consultationType: a.consultationType,
      appointmentDate: a.appointmentDate,
      appointmentTime: a.appointmentTime,
      amount: a.amount,
      status: a.status,
      transactionId: a.transactionId ?? "",
      createdAt: a.createdAt.toISOString(),
    };
    rows.push(columns.map((c) => toCsvValue(apiRow[c])).join(","));
  }

  const csv = rows.join("\n");
  const date = new Date().toISOString().slice(0, 10);
  logger.info("Admin CSV export");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="appointments-${date}.csv"`,
  );
  res.send(csv);
});

export default router;
