import {
  pgTable,
  text,
  integer,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appointmentsTable = pgTable("appointments", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dob: date("dob", { mode: "string" }).notNull(),
  timeOfBirth: text("time_of_birth").notNull(),
  placeOfBirth: text("place_of_birth").notNull(),
  gender: text("gender").notNull(),
  consultationType: text("consultation_type").notNull(),
  appointmentDate: date("appointment_date", { mode: "string" }).notNull(),
  appointmentTime: text("appointment_time").notNull(),
  notes: text("notes").notNull().default(""),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending_payment"),
  transactionId: text("transaction_id"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(
  appointmentsTable,
).omit({ createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
