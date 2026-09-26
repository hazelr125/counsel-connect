import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// application_status.status enum — spec.md §3
export const applicationStatusEnum = pgEnum("application_status_enum", [
  "new",
  "reviewed",
  "contacted",
  "converted",
]);

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  cgpa: numeric("cgpa", { precision: 3, scale: 2 }),
  workexYears: integer("workex_years"),
  budgetInr: integer("budget_inr"),
  courseInterest: text("course_interest"),
  countryPreference: text("country_preference"),
  intakePeriod: text("intake_period"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const intakes = pgTable("intakes", {
  id: serial("id").primaryKey(),
  periodLabel: text("period_label").notNull(), // e.g. "May 2027"
  seatCap: integer("seat_cap").notNull(),
  seatsFilled: integer("seats_filled").notNull().default(0),
});

export const triageBriefs = pgTable("triage_briefs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  summary: text("summary"),
  suggestedCountries: text("suggested_countries").array(),
  // Added alongside the Gemini triage integration (spec.md §4 requires
  // storing "the raw parsed result", and §4's output shape includes
  // `flags` even though §3's original column list didn't) — see spec.md
  // §3 note.
  flags: text("flags").array(),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const applicationStatus = pgTable("application_status", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  status: applicationStatusEnum("status").notNull().default("new"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
