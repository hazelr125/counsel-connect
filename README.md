# CounselConnect

A student intake and counsellor ops tool: a student submits their profile through an
intake form, Gemini generates a short AI triage brief from that profile, and a
counsellor works the resulting queue from a dashboard — reviewing briefs, tracking
status, and watching how full the current intake cohort is.

## What it does

- **Intake form** — students submit their profile (course interest, budget, CGPA,
  work experience, country preference)
- **AI triage** — each submission is sent to Gemini, which returns a short summary,
  suggested countries, and any flags worth a counsellor's attention
- **Counsellor dashboard** — a table of students with their triage brief and current
  status (new / reviewed / contacted / converted), updatable per row
- **Seat counter** — a live read on how many seats in the current intake are filled
  against its cap

## Tech stack

Next.js (App Router) + TypeScript, tRPC, Drizzle ORM + PostgreSQL (Neon), Tailwind CSS,
Google Gemini API.

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

## Screenshot

<!-- Replace with an actual screenshot of the counsellor dashboard once deployed. -->
![Counsellor dashboard screenshot placeholder](./screenshot.png)
