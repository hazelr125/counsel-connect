import { router, publicProcedure } from "../trpc";
import { intakes } from "../db/schema";
import { redis } from "../redis"; // <-- Update this path to your redis index.ts

export const intakesRouter = router({
  // Single active intake at this scope (spec.md §11 — no multi-intake
  // management), so this just returns the one row the seed script inserts.
  getCurrent: publicProcedure.query(async ({ ctx }) => {
    const CACHE_KEY = "intake:current";

    // 1. Try to get it from Redis first
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        console.log("CACHE HIT — Loaded from Redis!"); 
        return JSON.parse(cached); // Cache hit, skip Postgres
      }
    } catch (error) {
      console.error("CACHE MISS — Fetching from Postgres!:", error);
    }

    // 2. Cache miss (or Redis is down) — run the normal Drizzle query
    const [current] = await ctx.db.select().from(intakes).limit(1);
    const result = current ?? null;

    // 3. Save it to Redis for next time (30 seconds TTL)
    if (result) {
      try {
        await redis.setex(CACHE_KEY, 30, JSON.stringify(result));
      } catch (error) {
        console.error("Redis SET error (ignoring):", error);
      }
    }

    return result;
  }),
});