// Email notifications — sends booking confirmation to the client and
// an alert to the astrologer's inbox after payment is verified.
// Gracefully no-ops when SMTP credentials are not configured.

import nodemailer from "nodemailer";
import type { Appointment } from "@workspace/db";
import { logger } from "./logger";

const CONSULTATION_LABELS: Record<string, string> = {
  career: "Career",
  marriage: "Marriage & Relationships",
  health: "Health",
  finance: "Finance",
  general: "General Guidance",
};

function consultationLabel(id: string): string {
  return CONSULTATION_LABELS[id] ?? id;
}

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    logger.warn("SMTP credentials not configured — skipping email");
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: { user, pass },
  });
}

export async function sendAdminNotification(
  appointment: Appointment,
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return;

  const html = `
    <h2>New paid appointment — AstroGyan</h2>
    <p><strong>Client:</strong> ${appointment.fullName}</p>
    <p><strong>Email:</strong> ${appointment.email}</p>
    <p><strong>Phone:</strong> ${appointment.phone}</p>
    <p><strong>Consultation type:</strong> ${consultationLabel(appointment.consultationType)}</p>
    <p><strong>Appointment:</strong> ${appointment.appointmentDate} at ${appointment.appointmentTime}</p>
    <p><strong>Amount paid:</strong> ₹${appointment.amount}</p>
    <p><strong>Transaction / UTR:</strong> ${appointment.transactionId}</p>
    <p><strong>Paid at:</strong> ${appointment.paidAt}</p>
    <hr />
    <p><strong>Birth details</strong> — DOB: ${appointment.dob}, Time: ${appointment.timeOfBirth}, Place: ${appointment.placeOfBirth}</p>
    <p><strong>Client notes:</strong> ${appointment.notes || "—"}</p>
  `;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ??
      '"AstroGyan by Preeti Mangla" <noreply@astrogyan.in>',
    to,
    subject: `New booking: ${appointment.fullName} — ${appointment.appointmentDate} ${appointment.appointmentTime}`,
    html,
  });
}

export async function sendClientReceipt(
  appointment: Appointment,
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const html = `
    <div style="font-family:Georgia,serif;color:#2A2440;max-width:600px;">
      <h2 style="color:#8a6d0a;">Your appointment is confirmed ✨</h2>
      <p>Namaste ${appointment.fullName},</p>
      <p>Thank you for booking a consultation with AstroGyan by Preeti Mangla. Here is your receipt:</p>
      <table cellpadding="6" style="border-collapse:collapse;">
        <tr><td><strong>Consultation type</strong></td><td>${consultationLabel(appointment.consultationType)}</td></tr>
        <tr><td><strong>Date</strong></td><td>${appointment.appointmentDate}</td></tr>
        <tr><td><strong>Time</strong></td><td>${appointment.appointmentTime}</td></tr>
        <tr><td><strong>Amount paid</strong></td><td>₹${appointment.amount}</td></tr>
        <tr><td><strong>Transaction / UTR</strong></td><td>${appointment.transactionId}</td></tr>
      </table>
      <p>You will receive a call or message closer to your slot. For anything urgent, reach us on
      WhatsApp / call at +91 7082504021 or on Instagram
      <a href="https://instagram.com/astrogyan_by_priti">@astrogyan_by_priti</a>.</p>
      <p>With warmth,<br/>Preeti Mangla</p>
    </div>
  `;

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ??
      '"AstroGyan by Preeti Mangla" <noreply@astrogyan.in>',
    to: appointment.email,
    subject: "Your AstroGyan appointment is confirmed",
    html,
  });
}
