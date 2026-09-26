import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { publicProcedure, router } from "../trpc";
import {
  students,
  triageBriefs,
  applicationStatus,
  intakes,
  applicationStatusEnum,
} from "../db/schema";
import { studentIntakeSchema as createStudentInput } from "@/lib/validation/student";
import { generateTriageBrief } from "../ai/triage";

export const studentsRouter = router({
  // Inserts the student, increments the active intake's seats_filled, and
  // triggers Gemini triage generation (spec.md §4 / plan.md Hour 2:30-3:30).
  create: publicProcedure
    .input(createStudentInput)
    .mutation(async ({ ctx, input }) => {
      const [student] = await ctx.db
        .insert(students)
        .values({
          ...input,
          // numeric columns are string-typed in drizzle/pg — schema.ts wasn't
          // changed, so convert here rather than at the schema level.
          cgpa: input.cgpa !== undefined ? input.cgpa.toString() : undefined,
        })
        .returning();

      // NOTE: @neondatabase/serverless's neon-http driver doesn't support
      // interactive transactions, so this is two sequential statements, not
      // atomic. Fine at this scope (spec.md §11) — a real concurrency
      // guarantee would need the Pool/WebSocket driver instead.
      const [activeIntake] = await ctx.db.select().from(intakes).limit(1);
      if (activeIntake) {
        await ctx.db
          .update(intakes)
          .set({ seatsFilled: activeIntake.seatsFilled + 1 })
          .where(eq(intakes.id, activeIntake.id));
      }

      // spec.md §4 — blocking `await` for now, per plan.md's cut-line note
      // (Hour 3:30-4:30, item #2): make this non-blocking later if there's
      // time. generateTriageBrief() never throws — it resolves to null on
      // any API or parse failure — so this can't take the student insert
      // down with it.
      const brief = await generateTriageBrief({
        cgpa: input.cgpa,
        workexYears: input.workexYears,
        budgetInr: input.budgetInr,
        courseInterest: input.courseInterest,
        countryPreference: input.countryPreference,
      });

      // Always write a triage_briefs row so a reviewer can see an attempt
      // was made at generatedAt; fields are null when generation failed
      // (spec.md §4 — "store null... let the student record still save").
      await ctx.db.insert(triageBriefs).values({
        studentId: student.id,
        summary: brief?.summary ?? null,
        suggestedCountries: brief?.suggestedCountries ?? null,
        flags: brief?.flags ?? null,
      });

      return student;
    }),

  // Left-joined so students without a brief or status yet still show up.
  // Assumes at most one triage_briefs row per student (true today, since
  // create() will trigger exactly one triage generation per student once
  // Gemini is wired in) — if that assumption ever breaks, this needs a
  // "latest per student" subquery instead of a flat left join.
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        student: students,
        triageBrief: triageBriefs,
        status: applicationStatus,
      })
      .from(students)
      .leftJoin(triageBriefs, eq(triageBriefs.studentId, students.id))
      .leftJoin(applicationStatus, eq(applicationStatus.studentId, students.id))
      .orderBy(desc(students.createdAt));

    return rows;
  }),

  // Upserts application_status by studentId — first status change for a
  // student creates the row (default is "new" per schema, but no row exists
  // until the counsellor actually sets one).
  updateStatus: publicProcedure
    .input(
      z.object({
        studentId: z.number().int(),
        status: z.enum(applicationStatusEnum.enumValues),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(applicationStatus)
        .where(eq(applicationStatus.studentId, input.studentId));

      if (existing) {
        const [updated] = await ctx.db
          .update(applicationStatus)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(applicationStatus.studentId, input.studentId))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(applicationStatus)
        .values({ studentId: input.studentId, status: input.status })
        .returning();
      return created;
    }),
});
