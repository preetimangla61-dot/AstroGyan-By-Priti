import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";
import {
  GetAppointmentParams,
  GetAppointmentResponse,
  UpdateAppointmentStatusParams,
  UpdateAppointmentStatusHeader,
  UpdateAppointmentStatusBody,
  UpdateAppointmentStatusResponse,
} from "@workspace/api-zod";
import { toApiShape } from "./index";

const ALLOWED_STATUSES = [
  "pending_payment",
  "paid",
  "completed",
  "cancelled",
] as const;

function isAdmin(code: string | undefined): boolean {
  const adminCode = process.env.ADMIN_ACCESS_CODE;
  return Boolean(adminCode) && code === adminCode;
}

const router: IRouter = Router();

// GET /appointments/:id
router.get("/appointments/:id", async (req, res): Promise<void> => {
  const params = GetAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(GetAppointmentResponse.parse({ appointment: toApiShape(row) }));
});

// PATCH /appointments/:id — admin only, update status
router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const params = UpdateAppointmentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const header = UpdateAppointmentStatusHeader.safeParse(req.headers);
  if (!header.success || !isAdmin(header.data?.["x-admin-code"])) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = UpdateAppointmentStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!ALLOWED_STATUSES.includes(body.data.status as (typeof ALLOWED_STATUSES)[number])) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: body.data.status })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(
    UpdateAppointmentStatusResponse.parse({
      appointment: toApiShape(updated),
    }),
  );
});

export default router;
