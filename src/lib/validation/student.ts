import { z } from "zod";

// Mirrors the `students` table (spec.md §3). Shared by the intake form's
// client-side validation and the students.create tRPC input, per the
// single-source-of-truth convention in spec.md §9.
export const studentIntakeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  cgpa: z
    .number({ invalid_type_error: "CGPA must be a number" })
    .min(0, "CGPA can't be negative")
    .max(10, "CGPA can't be above 10")
    .optional(),
  workexYears: z
    .number({ invalid_type_error: "Enter a whole number" })
    .int("Enter a whole number")
    .min(0, "Can't be negative")
    .optional(),
  budgetInr: z
    .number({ invalid_type_error: "Enter a whole number" })
    .int("Enter a whole number")
    .min(0, "Can't be negative")
    .optional(),
  courseInterest: z.string().optional(),
  countryPreference: z.string().optional(),
  intakePeriod: z.string().optional(),
});

export type StudentIntakeInput = z.infer<typeof studentIntakeSchema>;
