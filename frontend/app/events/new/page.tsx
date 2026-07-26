import { Suspense } from "react";
import { CreateEventForm } from "@/components/CreateEventForm";

export default function NewEventPage() {
  return (
    <div className="flex-1">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">Create an event</h1>

      <div className="mt-4">
        <Suspense fallback={null}>
          <CreateEventForm />
        </Suspense>
      </div>
    </div>
  );
}
