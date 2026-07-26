import type { Event, EventListResponse, User } from "shared";
import { ApiError, apiFetch } from "./api";

export async function getRecentEvents(limit = 6): Promise<Event[]> {
  const result = await apiFetch<EventListResponse>(
    `/v1/events?upcoming=true&page=1&pageSize=${limit}`,
  );
  return result.events;
}

export type EventFilters = {
  sport?: string;
  keyword?: string;
  location?: string;
  page?: number;
  pageSize?: number;
};

export async function searchEvents(filters: EventFilters): Promise<EventListResponse> {
  const params = new URLSearchParams();
  if (filters.sport) params.set("sportId", filters.sport);
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.location) params.set("location", filters.location);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 12));

  return apiFetch<EventListResponse>(`/v1/events?${params.toString()}`);
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
