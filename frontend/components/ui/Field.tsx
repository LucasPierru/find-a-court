import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

// The recurring "label + control + error/hint" shape used by every form in
// this app (CreateEventForm, Login, Register, EventFilterBar).
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-black dark:text-zinc-50">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
      ) : null}
    </label>
  );
}
