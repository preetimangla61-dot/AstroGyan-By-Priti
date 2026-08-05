import { Router, type IRouter } from "express";
import QRCode from "qrcode";

const router: IRouter = Router();

// GET /qrcode?upiId=...&amount=...&name=...
// Returns a QR code PNG image for the given UPI payment details.
router.get("/qrcode", async (req, res): Promise<void> => {
  const upiId = String(req.query.upiId ?? "");
  const amount = String(req.query.amount ?? "");
  const name = String(req.query.name ?? "");

  if (!upiId) {
    res.status(400).json({ error: "upiId is required" });
    return;
  }

  // Build the UPI deep link used by all Indian payment apps
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR`;

  const png = await QRCode.toBuffer(upiUrl, {
    type: "png",
    width: 400,
    margin: 2,
    color: { dark: "#161233", light: "#F8F3E7" },
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(png);
});

export default router;
