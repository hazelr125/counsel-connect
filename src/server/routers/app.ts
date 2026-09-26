import { router } from "../trpc";
import { studentsRouter } from "./students";
import { intakesRouter } from "./intakes";

export const appRouter = router({
  students: studentsRouter,
  intakes: intakesRouter,
});

export type AppRouter = typeof appRouter;
