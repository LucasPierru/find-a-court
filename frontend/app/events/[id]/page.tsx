import { notFound } from "next/navigation";
import { getSportBySlug } from "shared";
import { getEventById } from "@/lib/events";
import { formatEventDateTime } from "@/lib/format";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const sport = getSportBySlug(event.sportId);

  return (
    <div className="flex-1 py-16">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {sport?.name ?? event.sportId}
      </span>

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {event.title}
      </h1>

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            When
          </dt>
          <dd className="mt-1 text-sm text-black dark:text-zinc-50">
            {formatEventDateTime(event.startTime)}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Cost
          </dt>
          <dd className="mt-1 text-sm text-black dark:text-zinc-50">
            {event.isFree ? "Free" : `€${event.price}`}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Location
          </dt>
          <dd className="mt-1 text-sm text-black dark:text-zinc-50">
            {event.location.name}
            <br />
            <span className="text-zinc-600 dark:text-zinc-400">
              {event.location.address}
            </span>
          </dd>
        </div>

        {event.participantLimit !== undefined && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Participant limit
            </dt>
            <dd className="mt-1 text-sm text-black dark:text-zinc-50">
              {event.participantLimit} players
            </dd>
          </div>
        )}
      </dl>

      {event.description && (
        <p className="mt-8 text-sm text-zinc-700 dark:text-zinc-300">
          {event.description}
        </p>
      )}
    </div>
  );
}
