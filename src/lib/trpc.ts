import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

// No tRPC client existed in the scaffold yet (IntakeForm.tsx intentionally
// stubs its submit with a timeout — see its own TODO). The dashboard is the
// first thing that needs real client-server calls, so this is added now.
export const trpc = createTRPCReact<AppRouter>();
