"use client";

import { trpc } from "@/lib/trpc";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/applicationStatus";

export function StudentsTable() {
  const utils = trpc.useContext();
  const studentsQuery = trpc.students.list.useQuery();
  const updateStatus = trpc.students.updateStatus.useMutation({
    // Refetch so the row reflects whatever the server actually persisted
    // (rather than trusting the optimistic value forever).
    onSettled: () => {
      utils.students.list.invalidate();
    },
  });

  if (studentsQuery.isLoading) {
    return (
      <div className="rounded-md border border-neutral-200 px-4 py-6 text-sm text-neutral-500">
        Loading students…
      </div>
    );
  }

  if (studentsQuery.isError) {
    return (
      <div className="rounded-md border border-red-200 px-4 py-6 text-sm text-red-600">
        Couldn&apos;t load students. Try refreshing the page.
      </div>
    );
  }

  const rows = studentsQuery.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-neutral-200 px-4 py-6 text-sm text-neutral-500">
        No intake submissions yet.
      </div>
    );
  }

  function handleStatusChange(studentId: number, status: ApplicationStatus) {
    updateStatus.mutate({ studentId, status });
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Contact</th>
            <th className="px-4 py-2.5">Triage summary</th>
            <th className="px-4 py-2.5">Suggested countries</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ student, triageBrief, status }) => {
            const currentStatus: ApplicationStatus =
              (status?.status as ApplicationStatus | undefined) ?? "new";
            const suggestedCountries = triageBrief?.suggestedCountries ?? [];

            return (
              <tr
                key={student.id}
                className="border-b border-neutral-100 last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  <div>{student.email}</div>
                  {student.phone && (
                    <div className="text-xs text-neutral-500">{student.phone}</div>
                  )}
                </td>
                <td className="max-w-[320px] px-4 py-3 text-neutral-700">
                  {triageBrief?.summary ? (
                    <span className="line-clamp-2">{triageBrief.summary}</span>
                  ) : (
                    <span className="text-neutral-400">Triage unavailable</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {suggestedCountries.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {suggestedCountries.map((c) => (
                        <span
                          key={c}
                          className="rounded-sm border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
                    value={currentStatus}
                    disabled={
                      updateStatus.isLoading &&
                      updateStatus.variables?.studentId === student.id
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        student.id,
                        e.target.value as ApplicationStatus
                      )
                    }
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
