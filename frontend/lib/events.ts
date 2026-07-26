import type { Event, User } from "shared";
import { ApiError, apiFetch } from "./api";

export async function getRecentEvents(limit = 6): Promise<Event[]> {
  const events = await apiFetch<Event[]>("/v1/events?upcoming=true");
  return events.slice(0, limit);
}

export type EventFilters = {
  sport?: string;
  keyword?: string;
  location?: string;
};

export async function searchEvents(filters: EventFilters): Promise<Event[]> {
  const query = filters.sport ? `?sportId=${encodeURIComponent(filters.sport)}` : "";
  const events = await apiFetch<Event[]>(`/v1/events${query}`);

  const keyword = filters.keyword?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return events
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
    );
}

export async function getEventById(id: string): Promise<Event | undefined> {
  try {
    return await apiFetch<Event>(`/v1/events/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

export async function getEventParticipants(id: string): Promise<User[]> {
  return apiFetch<User[]>(`/v1/events/${id}/participants`);
}
