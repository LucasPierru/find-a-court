import { Suspense } from "react";
import { CreateEventForm } from "@/components/CreateEventForm";

export default function NewEventPage() {
  return (
    <div className="flex-1 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Create an event
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        There&apos;s no backend yet, so submitting won&apos;t actually save the
        event.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <CreateEventForm />
        </Suspense>
      </div>
    </div>
  );
}
