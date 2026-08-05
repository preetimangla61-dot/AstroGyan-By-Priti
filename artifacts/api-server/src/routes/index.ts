import { Router, type IRouter } from "express";
import healthRouter from "./health";
import slotsRouter from "./slots";
import appointmentsRouter from "./appointments/index";
import appointmentsIdRouter from "./appointments/id";
import appointmentsExportRouter from "./appointments/export";
import paymentRouter from "./payment";
import qrcodeRouter from "./qrcode";

const router: IRouter = Router();

router.use(healthRouter);
router.use(slotsRouter);
// Export must come before :id to avoid "export" matching as an id param
router.use(appointmentsExportRouter);
router.use(appointmentsRouter);
router.use(appointmentsIdRouter);
router.use(paymentRouter);
router.use(qrcodeRouter);

export default router;
