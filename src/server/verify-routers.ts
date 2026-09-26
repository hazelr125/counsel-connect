import { appRouter } from "./routers/_app";
import { createContext } from "./trpc";

async function main() {
  const caller = appRouter.createCaller(createContext());

  console.log("\n=== intakes.getCurrent (before) ===");
  const intakeBefore = await caller.intakes.getCurrent();
  console.log(intakeBefore);
  if (!intakeBefore) {
    throw new Error("No intake found — did you run `npm run db:seed`?");
  }

  console.log("\n=== students.create ===");
  const student = await caller.students.create({
    name: "Test Student",
    email: `test-${Date.now()}@example.com`,
    phone: "+91-9000000000",
    cgpa: 8.5,
    workexYears: 2,
    budgetInr: 1500000,
    courseInterest: "MS Computer Science",
    countryPreference: "Canada",
    intakePeriod: intakeBefore.periodLabel,
  });
  console.log(student);

  console.log("\n=== students.list ===");
  const list = await caller.students.list();
  console.log(JSON.stringify(list, null, 2));

  console.log("\n=== students.updateStatus ===");
  const updated = await caller.students.updateStatus({
    studentId: student.id,
    status: "reviewed",
  });
  console.log(updated);

  console.log("\n=== intakes.getCurrent (after) — seatsFilled should be +1 ===");
  const intakeAfter = await caller.intakes.getCurrent();
  console.log(intakeAfter);

  const delta = intakeAfter!.seatsFilled - intakeBefore.seatsFilled;
  console.log(`\nseatsFilled delta: ${delta} (expected 1)`);
}

main()
  .then(() => {
    console.log("\n✅ all procedures ran without throwing");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ verification failed:", err);
    process.exit(1);
  });
