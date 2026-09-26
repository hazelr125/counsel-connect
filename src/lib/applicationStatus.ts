// Mirrors applicationStatusEnum in src/server/db/schema.ts (spec.md §3).
// Kept as its own small client-safe constant rather than importing
// schema.ts directly, since schema.ts pulls in drizzle-orm/pg-core, which
// has no reason to end up in the dashboard's client bundle.
export const APPLICATION_STATUSES = [
  "new",
  "reviewed",
  "contacted",
  "converted",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  converted: "Converted",
};
