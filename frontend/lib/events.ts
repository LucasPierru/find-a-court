import type { Event } from "shared";
import { mockEvents } from "./mock-data";

// All functions are async, even though currently backed by an in-memory
// array, so call sites don't need to change once these become real fetches
// to the backend.

export async function getRecentEvents(limit = 6): Promise<Event[]> {
  return [...mockEvents]
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, limit);
}

export type EventFilters = {
  sport?: string;
  keyword?: string;
  location?: string;
};

export async function searchEvents(filters: EventFilters): Promise<Event[]> {
  const keyword = filters.keyword?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return mockEvents
    .filter((event) => !filters.sport || event.sportId === filters.sport)
    .filter(
      (event) =>
        !keyword ||
        event.title.toLowerCase().includes(keyword) ||
        event.description?.toLowerCase().includes(keyword),
    )
    .filter(
      (event) =>
        !location ||
        event.location.name.toLowerCase().includes(location) ||
        event.location.address.toLowerCase().includes(location),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  return mockEvents.find((event) => event.id === id);
}
