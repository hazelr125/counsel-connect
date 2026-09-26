import { db } from "./index";
import { intakes } from "./schema";

async function seed() {
  const [intake] = await db
    .insert(intakes)
    .values({
      periodLabel: "May 2027",
      seatCap: 60,
      seatsFilled: 0,
    })
    .returning();

  console.log("Seeded intake:", intake);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
