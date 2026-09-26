import { SeatCounter } from "@/components/dashboard/SeatCounter";
import { StudentsTable } from "@/components/dashboard/StudentsTable";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-base font-medium text-neutral-900">
            Counsellor dashboard
          </h1>
          <p className="text-sm text-neutral-600">
            Review intake submissions and move students through the pipeline.
          </p>
        </div>

        <SeatCounter />
        <StudentsTable />
      </div>
    </main>
  );
}
