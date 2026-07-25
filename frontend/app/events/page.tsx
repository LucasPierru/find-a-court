import { SPORTS } from "shared";
import { EventCard } from "@/components/EventCard";
import { EventFilterBar } from "@/components/EventFilterBar";
import { searchEvents } from "@/lib/events";

type EventsPageProps = {
  searchParams: Promise<{
    sport?: string;
    q?: string;
    location?: string;
    created?: string;
  }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const events = await searchEvents({
    sport: params.sport,
    keyword: params.q,
    location: params.location,
  });

  return (
    <div className="flex-1 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Browse events
      </h1>

      {params.created === "1" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          Event created — but there&apos;s no backend yet to persist it, so it
          won&apos;t appear below until one exists.
        </div>
      )}

      <div className="mt-6">
        <EventFilterBar
          key={`${params.sport ?? ""}-${params.q ?? ""}-${params.location ?? ""}`}
          sports={SPORTS}
          sport={params.sport}
          keyword={params.q}
          location={params.location}
        />
      </div>

      {events.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-600 dark:text-zinc-400">
          No events match your filters.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
