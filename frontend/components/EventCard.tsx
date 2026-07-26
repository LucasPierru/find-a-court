import Image from "next/image";
import Link from "next/link";
import type { Event } from "shared";
import { getSportBySlug } from "shared";
import { formatEventDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

type EventCardProps = {
  event: Event;
  imageUrl: string;
};

export function EventCard({ event, imageUrl }: EventCardProps) {
  const sport = getSportBySlug(event.sportId);

  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className="overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 h-full">
        <div className="relative h-32 w-full bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={imageUrl}
            alt={sport?.name ?? event.sportId}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {sport?.name ?? event.sportId}
            </span>
            <span
              className={
                event.isFree
                  ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              }>
              {event.isFree ? "Free" : `€${event.price}`}
            </span>
          </div>

          <CardTitle>{event.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{event.location.name}</span>
            <span>{formatEventDateTime(event.startTime)}</span>
            {event.participantLimit !== undefined && (
              <span>
                {event.participantLimit - event.participantCount > 0
                  ? `${event.participantLimit - event.participantCount} spot${
                      event.participantLimit - event.participantCount === 1 ? "" : "s"
                    } left`
                  : "Full"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
