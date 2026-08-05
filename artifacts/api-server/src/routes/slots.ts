import { Router, type IRouter } from "express";
import { GetSlotsQueryParams } from "@workspace/api-zod";
import { getSlotsForDate } from "../lib/slots";

const router: IRouter = Router();

router.get("/slots", async (req, res): Promise<void> => {
  const parsed = GetSlotsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slots = await getSlotsForDate(parsed.data.date);
  res.json({ slots });
});

export default router;
