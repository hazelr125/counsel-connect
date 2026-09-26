"use client";

import { trpc } from "@/lib/trpc";

export function SeatCounter() {
  const { data, isLoading, isError } = trpc.intakes.getCurrent.useQuery();

  if (isLoading) {
    return (
      <div className="rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-500">
        Loading seat count…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-500">
        No active intake.
      </div>
    );
  }

  const pct =
    data.seatCap > 0
      ? Math.min(100, Math.round((data.seatsFilled / data.seatCap) * 100))
      : 0;

  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {data.periodLabel} intake
        </p>
        <p className="text-lg font-medium text-neutral-900">
          {data.seatsFilled} / {data.seatCap} seats filled
        </p>
      </div>
      <div className="h-1.5 w-40 rounded-sm bg-neutral-100">
        <div
          className="h-1.5 rounded-sm bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
