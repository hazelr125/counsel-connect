import { GoogleGenAI } from "@google/genai";

// spec.md §4 — input to Gemini is the student's submitted fields, exactly:
// cgpa, workex_years, budget_inr, course_interest, country_preference.
export type TriageInput = {
  cgpa?: number;
  workexYears?: number;
  budgetInr?: number;
  courseInterest?: string;
  countryPreference?: string;
};

// spec.md §4 — required output shape.
export type TriageResult = {
  summary: string;
  suggestedCountries: string[];
  flags: string[];
};

/**
 * Builds the triage prompt from the student's submitted fields (spec.md §4).
 * Pulled out as its own function so it — and the parser below — can be
 * exercised without a live network call.
 */
export function buildTriagePrompt(input: TriageInput): string {
  const profile = {
    cgpa: input.cgpa ?? null,
    workex_years: input.workexYears ?? null,
    budget_inr: input.budgetInr ?? null,
    course_interest: input.courseInterest ?? null,
    country_preference: input.countryPreference ?? null,
  };

  return `You are a study-abroad admissions counsellor's triage assistant.

A student has just submitted an intake form. Here is their profile as structured JSON:

${JSON.stringify(profile, null, 2)}

Based on this profile, write a short triage brief for the counsellor who will review this
student next. Respond with ONLY a JSON object — no prose, no markdown code fences — matching
exactly this shape:

{
  "summary": "2-3 sentence assessment of this student's profile and readiness",
  "suggested_countries": ["country names worth exploring for this student, best fit first"],
  "flags": ["short flags for the counsellor's attention, e.g. missing info, budget mismatch, strong profile; empty array if nothing to flag"]
}`;
}

/**
 * Defensively parses a raw Gemini text response into the required shape.
 * Returns null on any malformed / unexpected output rather than throwing,
 * so callers can apply the spec.md §4 "store null, don't block" rule
 * uniformly for both parse failures and API failures.
 */
export function parseTriageResponse(rawText: string): TriageResult | null {
  try {
    const parsed = JSON.parse(rawText);

    const isStringArray = (v: unknown): v is string[] =>
      Array.isArray(v) && v.every((item) => typeof item === "string");

    if (
      typeof parsed?.summary !== "string" ||
      !isStringArray(parsed?.suggested_countries) ||
      !isStringArray(parsed?.flags)
    ) {
      return null;
    }

    return {
      summary: parsed.summary,
      suggestedCountries: parsed.suggested_countries,
      flags: parsed.flags,
    };
  } catch {
    return null;
  }
}

let cachedClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return cachedClient;
}

/**
 * spec.md §4 — calls the Gemini API server-side and returns the parsed
 * triage brief, or null on ANY failure (missing key, network/API error,
 * malformed/unparseable response). Never throws — students.create relies
 * on that to let the student record persist regardless of triage outcome.
 *
 * Failures are logged (not thrown) so a bad key, a retired model, or a
 * malformed response is visible in the server console instead of silently
 * becoming "Triage unavailable" with nothing to debug from.
 */
export async function generateTriageBrief(
  input: TriageInput
): Promise<TriageResult | null> {
  try {
    const ai = getClient();
    if (!ai) return null; // GEMINI_API_KEY not configured

    const prompt = buildTriagePrompt(input);
    // "gemini-flash-latest" is Google's version-less alias for the current
    // Flash model — it hot-swaps as Google retires/replaces models, so this
    // shouldn't need to be updated every time a model generation ages out
    // (unlike "gemini-1.5-flash", which is what broke this the first time).
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const rawText = response.text;
    if (!rawText) {
      console.error("Gemini triage: empty response text", response);
      return null;
    }

    const parsed = parseTriageResponse(rawText);
    if (!parsed) {
      console.error("Gemini triage: response didn't match expected shape:", rawText);
    }
    return parsed;
  } catch (err) {
    console.error("Gemini triage call failed:", err);
    return null;
  }
}
