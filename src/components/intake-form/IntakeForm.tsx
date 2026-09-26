"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { studentIntakeSchema } from "@/lib/validation/student";
import { trpc } from "@/lib/trpc";

type FormState = {
  name: string;
  email: string;
  phone: string;
  cgpa: string;
  workexYears: string;
  budgetInr: string;
  courseInterest: string;
  countryPreference: string;
  intakePeriod: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  cgpa: "",
  workexYears: "",
  budgetInr: "",
  courseInterest: "",
  countryPreference: "",
  intakePeriod: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

// Raw <input> values are always strings — convert to the shape
// studentIntakeSchema (and students.create) actually expects before validating.
function toApiInput(state: FormState) {
  return {
    name: state.name,
    email: state.email,
    phone: state.phone || undefined,
    cgpa: state.cgpa === "" ? undefined : Number(state.cgpa),
    workexYears: state.workexYears === "" ? undefined : Number(state.workexYears),
    budgetInr: state.budgetInr === "" ? undefined : Number(state.budgetInr),
    courseInterest: state.courseInterest || undefined,
    countryPreference: state.countryPreference || undefined,
    intakePeriod: state.intakePeriod || undefined,
  };
}

export function IntakeForm() {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createStudent = trpc.students.create.useMutation();

  function handleChange(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = studentIntakeSchema.safeParse(toApiInput(values));
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormState;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setSubmitError(null);

    try {
      // parsed.data is already the shape students.create expects — zod
      // stripped the raw string inputs down to it above.
      await createStudent.mutateAsync(parsed.data);
      setStatus("success");
    } catch {
      // Gemini failures never reach here — students.create swallows those
      // and still saves the student (spec.md §4). A rejection here means
      // the request itself failed (network, validation, or a DB error).
      setStatus("error");
      setSubmitError("Something went wrong submitting your application. Try again.");
    }
  }

  function handleReset() {
    setValues(initialState);
    setErrors({});
    setStatus("idle");
    setSubmitError(null);
    createStudent.reset();
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-[560px] rounded-md border border-neutral-200 p-6">
        <div className="mb-3 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-accent"
          >
            <path
              d="M13 4L6 11L3 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-base font-medium text-neutral-900">
            Application received
          </h2>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-neutral-600">
          A counsellor will review your profile and follow up by email or phone.
          You don&apos;t need to do anything else right now.
        </p>
        <Button variant="secondary" onClick={handleReset}>
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[560px] space-y-8 rounded-md border border-neutral-200 p-6"
    >
      <div>
        <h1 className="mb-1 text-base font-medium text-neutral-900">
          Intake application
        </h1>
        <p className="text-sm text-neutral-600">
          Tell us about yourself so a counsellor can review your profile.
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="w-full border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-800">
          Applicant details
        </legend>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={handleChange("name")}
            invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">
            Phone <span className="font-normal text-neutral-400">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange("phone")}
            invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="w-full border-b border-neutral-200 pb-2 text-sm font-medium text-neutral-800">
          Program preferences
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cgpa">
              CGPA <span className="font-normal text-neutral-400">(optional)</span>
            </Label>
            <Input
              id="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={values.cgpa}
              onChange={handleChange("cgpa")}
              invalid={!!errors.cgpa}
            />
            {errors.cgpa && <p className="text-xs text-red-600">{errors.cgpa}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workexYears">
              Work experience (yrs){" "}
              <span className="font-normal text-neutral-400">(optional)</span>
            </Label>
            <Input
              id="workexYears"
              type="number"
              step="1"
              min="0"
              value={values.workexYears}
              onChange={handleChange("workexYears")}
              invalid={!!errors.workexYears}
            />
            {errors.workexYears && (
              <p className="text-xs text-red-600">{errors.workexYears}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budgetInr">
            Budget (INR) <span className="font-normal text-neutral-400">(optional)</span>
          </Label>
          <Input
            id="budgetInr"
            type="number"
            step="1000"
            min="0"
            value={values.budgetInr}
            onChange={handleChange("budgetInr")}
            invalid={!!errors.budgetInr}
          />
          {errors.budgetInr && (
            <p className="text-xs text-red-600">{errors.budgetInr}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="courseInterest">
            Course of interest{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </Label>
          <Input
            id="courseInterest"
            value={values.courseInterest}
            onChange={handleChange("courseInterest")}
            invalid={!!errors.courseInterest}
          />
          {errors.courseInterest && (
            <p className="text-xs text-red-600">{errors.courseInterest}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="countryPreference">
            Preferred country{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </Label>
          <Input
            id="countryPreference"
            value={values.countryPreference}
            onChange={handleChange("countryPreference")}
            invalid={!!errors.countryPreference}
          />
          {errors.countryPreference && (
            <p className="text-xs text-red-600">{errors.countryPreference}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="intakePeriod">
            Intake period{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </Label>
          <Input
            id="intakePeriod"
            placeholder="e.g. May 2027"
            value={values.intakePeriod}
            onChange={handleChange("intakePeriod")}
            invalid={!!errors.intakePeriod}
          />
          {errors.intakePeriod && (
            <p className="text-xs text-red-600">{errors.intakePeriod}</p>
          )}
        </div>
      </fieldset>

      {submitError && (
        <p className="border-l-2 border-red-600 pl-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
