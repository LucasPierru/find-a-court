import Link from "next/link";
import { FindCourtView } from "@/components/FindCourtView";
import { EventCard } from "@/components/EventCard";
import { getRecentEvents } from "@/lib/events";

export default async function Home() {
  const recentEvents = await getRecentEvents();

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      <FindCourtView />

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">Recent events</h2>
          <Link
            href="/events"
            className="text-sm font-medium text-black underline underline-offset-2 dark:text-zinc-50">
            Browse all
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
