import { z } from "zod"

export const consultationTypes = [
  { id: "career", label: "Career & Profession", price: 799 },
  { id: "marriage", label: "Marriage & Relationships", price: 999 },
  { id: "health", label: "Health & Well-being", price: 799 },
  { id: "finance", label: "Wealth & Finance", price: 899 },
  { id: "general", label: "General Guidance", price: 599 }
];

export const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().regex(/^\+91[0-9]{10}$/, "Please enter a valid Indian phone number starting with +91"),
  dob: z.string().min(1, "Date of birth is required"),
  timeOfBirth: z.string().min(1, "Time of birth is required"),
  placeOfBirth: z.string().min(2, "Place of birth is required"),
  gender: z.enum(["Female", "Male", "Other"], { required_error: "Please select a gender" }),
  consultationType: z.string().min(1, "Please select a consultation type"),
  appointmentDate: z.string().min(1, "Please select an appointment date"),
  appointmentTime: z.string().min(1, "Please select a time slot"),
  notes: z.string().optional()
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
