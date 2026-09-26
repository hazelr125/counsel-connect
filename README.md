# GradGuide — Intake & Counsellor Ops Dashboard

A 5-hour vertical slice of GradGuide's core operating loop: a student submits an intake
form, Gemini generates a triage brief from their profile, and a counsellor works the
result from a dense ops dashboard. It's deliberately not the full product — it's the
thinnest slice that proves the concept end-to-end. See `spec.md` for the full
architecture and `plan.md` for how the build was timeboxed.

## Why this shape

GradGuide's actual operation runs on named counsellors working capacity-limited intake
cohorts against a curated country "book" — a counsellor isn't reading raw applications
cold, they're triaging a queue against a seat cap, and they need a fast read on each
student before deciding who to prioritize. This build tests whether an AI-generated
triage summary can stand in for that first read: does a 2-3 sentence brief plus
suggested countries actually save a counsellor time when they're scanning a list, not a
stack of individual forms? The seat counter and status pipeline exist because those are
the two numbers a counsellor actually watches day to day — how full is this intake, and
where is each student in the funnel.

## Setup

```bash
npm install

cp .env.example .env
# fill in DATABASE_URL (Neon connection string) and GEMINI_API_KEY

npm run db:push     # sync schema.ts to your Neon database
npm run db:seed     # seed one active intake (60-seat cap by default)

npm run dev          # http://localhost:3000 — intake form
                      # http://localhost:3000/dashboard — counsellor dashboard
```

Optional server-side smoke check (creates a test student end-to-end, bypassing the UI):

```bash
npm run verify
```

## Known limitations

This is a 5-hour scope, not a finished product — see `spec.md` §11 for what was
deliberately left out (auth, Redis, email automation, the real country "book"). Also
worth knowing: `students.create`'s two DB writes (insert student, increment
`seats_filled`) aren't wrapped in a transaction — the neon-http driver doesn't support
interactive transactions — so a failure partway through can leave the seat count
incremented without a matching triage brief. Acceptable at this scope per spec.md §11;
would need the Neon Pool/WebSocket driver to close properly.

## Screenshot

<!-- Replace with an actual screenshot of the counsellor dashboard once deployed. -->
![Counsellor dashboard screenshot placeholder](./screenshot.png)
