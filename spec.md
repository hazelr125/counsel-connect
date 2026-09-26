# spec.md — GradGuide Intake & Counsellor Ops Dashboard

## 1. Overview
A scoped, 5-hour vertical slice of the student-intake → AI-triage → counsellor-dashboard flow, modeled on how GradGuide's actual operation works (named counsellors, capacity-limited intakes, a curated country "book"). This is deliberately **not** the full JD stack — it's the
thinnest slice that still proves the concept end-to-end. Anything not needed for that slice is pushed to §11 (Boundaries) rather than attempted half-finished.

## 2. Architecture
- **Framework:** Next.js 14 (App Router), TypeScript, `strict: true`
- **API layer:** tRPC, colocated in the Next.js app (no separate server process)
- **Database:** PostgreSQL via Neon (serverless — no local Docker/Postgres setup needed
  inside this timebox) + Drizzle ORM
- **AI:** Google Gemini API for intake triage briefs
- **Styling:** Tailwind CSS + a small set of shadcn/ui primitives, constrained per §5
- **Deployment:** Vercel (app + API routes) + Neon (hosted DB)

Deferred to a later pass, not attempted here: Redis, Docker, multi-role auth, email/notification
automation, Chrome-extension-style integrations. See §11.

## 3. Data Model / Contracts
Drizzle schema (`src/server/db/schema.ts`):
- `students` — id, name, email, phone, cgpa, workex_years, budget_inr, course_interest,
  country_preference, intake_period, created_at
- `intakes` — id, period_label (e.g. "May 2027"), seat_cap, seats_filled
- `triage_briefs` — id, student_id (FK), summary (text), suggested_countries (text[]),
  generated_at
- `application_status` — id, student_id (FK), status (enum: new / reviewed / contacted /
  converted), updated_at

tRPC routers:
- `students.create(input)` → inserts student, increments `intakes.seats_filled`, triggers
  Gemini triage generation
- `students.list()` → students joined with their latest triage brief + status, newest first
- `students.updateStatus(id, status)` → counsellor moves a student through the pipeline
- `intakes.getCurrent()` → returns the active intake's `seats_filled` / `seat_cap`

## 4. AI Triage Contract
- **Input to Gemini:** structured JSON of the student profile (cgpa, workex_years,
  budget_inr, course_interest, country_preference)
- **Required output shape (enforce via prompt + parse defensively):**
  ```json
  { "summary": "string", "suggested_countries": ["string"], "flags": ["string"] }
  ```
- Store the raw parsed result in `triage_briefs`. If parsing fails or the call errors,
  store `null` and let the student record still save — a missing brief should never block
  intake creation.

## 5. UI Direction
This is an internal ops tool, design it like one:
- **No gradients** anywhere. Flat, solid colors only.
- **No glassmorphism, glow effects, or "AI-slop" visual clichés** — no sparkle icons, no
  purple-to-blue gradient accents, no oversized emoji as UI elements.
- **No pill-shaped buttons or pill badges.** Use rectangular buttons and status tags with a
  small, consistent corner radius (2–4px), not fully rounded ends.
- One accent color, used sparingly (primary actions only). Everything else in neutral grays.
  Typography does the hierarchy work, not color.
- Reference feel: Linear / Notion / GitHub's internal tooling — dense, functional, quiet —
  not a landing page.
- The counsellor dashboard is a **table/list**, not a card grid. Card grids are for
  marketing; this is data you scan quickly.

## 6. Dependencies
```
next, react, react-dom, typescript
@trpc/server, @trpc/client, @trpc/next, @tanstack/react-query
drizzle-orm, drizzle-kit, @neondatabase/serverless
zod
tailwindcss
@google/generative-ai
```
shadcn/ui: pull in only `button`, `table`, `badge`, `input`, `textarea`, `select`, `card` —
override the default border-radius on `button` and `badge` to match §5.

## 7. Commands
```
npm run dev         # local dev server
npm run build        # production build
npm run db:push       # drizzle-kit push (sync schema to Neon)
npm run db:seed       # seed one active intake + a couple sample students
npm run typecheck     # tsc --noEmit
```

## 8. Testing / Verification Strategy

No full test suite fits a 5-hour budget — verification is type-level plus manual QA:

- TypeScript strict mode is the primary correctness net; tRPC gives end-to-end type safety
  from server procedures to client calls, so most integration bugs surface at compile time.
- Optional, only if time remains in Hour 5: one Vitest test on the Gemini prompt-building
  function, asserting it returns something JSON-parseable — mock the actual API call.
- Manual QA checklist (run once, before calling it done):
  1. Submit a full intake form → student appears in the dashboard with a generated brief
  2. Submit with optional fields blank → doesn't crash, brief still generates
  3. Seat counter increments after submission and matches the DB value on refresh
  4. Status dropdown change persists after a page reload
  5. Layout holds at 375px and 1440px widths

## 9. Code Style

- TypeScript everywhere, `strict: true`
- tRPC procedures live in `src/server/routers/*.ts`, one file per resource
- `src/server/db/schema.ts` is the single source of truth for the data model
- Components: PascalCase, colocated by feature (`src/components/intake-form/`,
  `src/components/dashboard/`)
- No inline styles — Tailwind utility classes only
- Named exports everywhere except Next.js `page.tsx` / `layout.tsx` files

## 10. Git Workflow

Single `main` branch — this is a 5-hour solo build, feature branches add overhead with no
payoff at this scope. Commit after each working vertical slice, not after each file:

1. `chore: scaffold app, Drizzle schema, Neon connection`
2. `feat: intake form + student creation`
3. `feat: Gemini triage integration`
4. `feat: counsellor dashboard + status updates`
5. `feat: seat counter widget + polish`
6. `docs: README with setup + screenshot`

Conventional commit prefixes (`feat` / `fix` / `chore` / `docs`), one logical change per commit.

## 11. Boundaries — explicitly out of scope for this build

Documented here on purpose, so these read as deliberate scope decisions, not gaps you missed:

- Multi-role auth/authz (student login vs. counsellor login) — this build uses a single,
  unauthenticated counsellor view
- Redis caching layer
- Docker containerization — Neon removes the need for a local Postgres container inside
  this timebox
- Email/notification automation (deadline reminders, capacity alerts)
- The real country/university "book" business rules — a static seed list stands in
- Chrome extension or any cross-tool integration
