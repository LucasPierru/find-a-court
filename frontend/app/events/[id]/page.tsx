import Image from "next/image";
import { notFound } from "next/navigation";
import { getSportBySlug } from "shared";
import { Calendar, MapPin, Users } from "lucide-react";
import { EventLocationMap } from "@/components/EventLocationMap";
import { EventParticipation } from "@/components/EventParticipation";
import { getEventById, getEventParticipants } from "@/lib/events";
import { getSportPhotoUrls } from "@/lib/unsplash";
import { formatEventDateTime } from "@/lib/format";
import { Card } from "@/components/ui";

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
  const [participants, sportPhotoUrls] = await Promise.all([
    getEventParticipants(id),
    getSportPhotoUrls(),
  ]);

  return (
    <div className="flex-1">
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-zinc-100 sm:h-72 dark:bg-zinc-800">
        <Image
          src={sportPhotoUrls[event.sportId]}
          alt={sport?.name ?? event.sportId}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {sport?.name ?? event.sportId}
        </span>
        <span
          className={
            event.isFree
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          }
        >
          {event.isFree ? "Free" : `€${event.price}`}
        </span>
      </div>

      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {event.title}
      </h1>

      <Card className="mt-6">
        <dl className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                When
              </dt>
              <dd className="mt-1 text-sm text-black dark:text-zinc-50">
                {formatEventDateTime(event.startTime)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Location
              </dt>
              <dd className="mt-1 text-sm text-black dark:text-zinc-50">
                {event.location.name}
                <br />
                <span className="text-zinc-600 dark:text-zinc-400">{event.location.address}</span>
              </dd>
            </div>
          </div>

          {event.participantLimit !== undefined && (
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Participant limit
                </dt>
                <dd className="mt-1 text-sm text-black dark:text-zinc-50">
                  {event.participantLimit} players
                </dd>
              </div>
            </div>
          )}
        </dl>
      </Card>

      {event.location.lat !== undefined && event.location.lng !== undefined && (
        <div className="mt-6 h-64 w-full overflow-hidden rounded-xl sm:h-80">
          <EventLocationMap
            lat={event.location.lat}
            lng={event.location.lng}
            name={event.location.name}
          />
        </div>
      )}

      {event.description && (
        <p className="mt-6 text-sm text-zinc-700 dark:text-zinc-300">{event.description}</p>
      )}

      <EventParticipation
        eventId={event.id}
        organizerId={event.organizerId}
        initialParticipants={participants}
      />
    </div>
  );
}
