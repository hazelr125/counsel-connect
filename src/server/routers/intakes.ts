import { router, publicProcedure } from "../trpc";
import { intakes } from "../db/schema";

export const intakesRouter = router({
  // Single active intake at this scope (spec.md §11 — no multi-intake
  // management), so this just returns the one row the seed script inserts.
  getCurrent: publicProcedure.query(async ({ ctx }) => {
    const [current] = await ctx.db.select().from(intakes).limit(1);
    return current ?? null;
  }),
});
