# plan.md — CouncelConnect Intake & Counsellor Ops Dashboard

Workflow: **Specification → Implementation Plan → Implementation**

## Phase 1: Specification (done)

See `spec.md` — architecture, data model, tRPC contracts, and UI direction are locked
before any code is written. If something in this plan turns out to conflict with `spec.md`
mid-build, update `spec.md` first, then keep going — don't let the two drift apart.

## Phase 2: Implementation Plan (5-hour timebox)

**Hour 0:00–0:30 — Scaffold**
- `create-next-app` (TypeScript, App Router, Tailwind)
- Install tRPC, Drizzle, Neon client, shadcn/ui, zod, Gemini SDK
- Create a Neon project, add `DATABASE_URL` to `.env`
- Write `schema.ts` (students, intakes, triage_briefs, application_status), run `db:push`

**Hour 0:30–1:30 — Backend contracts**
- tRPC server setup (context + `appRouter`)
- `students` router: `create`, `list`, `updateStatus`
- `intakes` router: `getCurrent`
- Seed script: one active intake row (e.g. `seat_cap: 60, seats_filled: 0`)

**Hour 1:30–2:30 — Intake form (student-facing)**
- Build the form per the UI direction in `spec.md` §5 — no pills, no gradients
- zod validation matching the schema
- On submit: call `students.create`, which inserts the record, increments
  `intakes.seats_filled`, and triggers the Gemini triage call

**Hour 2:30–3:30 — Gemini triage integration**
- Prompt template built from the student's submitted fields
- Call the Gemini API server-side inside `students.create`
- Parse the JSON response into `triage_briefs`; on any parse/API failure, save `null` and
  let the student record persist regardless (per `spec.md` §4)

**Hour 3:30–4:30 — Counsellor dashboard**
- Table view: students joined with their triage brief + current status
- Status dropdown per row, wired to `updateStatus`
- Seat counter widget at the top, backed by `intakes.getCurrent`

**Hour 4:30–5:00 — Polish + deploy**
- Run the manual QA checklist from `spec.md` §8, start to finish
- Deploy to Vercel, wire up the Neon env vars there
- Write a short README: what it is, why you built it, setup steps, one screenshot

## Cut line — if you're running behind

Drop in this order, so there's always a working end-to-end story at the 5-hour mark:

1. Skip the optional Vitest smoke test entirely
2. Skip making the Gemini call non-blocking — just `await` it inline in `students.create`,
   even if the form feels a beat slower on submit
3. Drop the seat counter widget — the form → AI brief → dashboard pipeline is the part that
   matters; the counter is a nice-to-have
4. If the Gemini integration itself is the blocker past hour 3, stub it with a templated
   summary function so the dashboard still shows something real, and note in the README
   that live Gemini calls are the immediate next step

## Phase 3: Implementation

Work through Phase 2 in order. Commit after each hour block finishes, per the git workflow
in `spec.md` §10 — not after each individual file. Before moving to the next block, confirm
the current one's own mini-checklist passes (form submits cleanly, dashboard shows real
data, etc.). A half-working feature costs more time to debug later in the build than it
costs to finish properly now.
