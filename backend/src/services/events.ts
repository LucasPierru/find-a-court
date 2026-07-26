import type { CreateEvent, Event, EventListResponse, UpdateEvent, User } from "shared";
import * as eventsRepository from "../repositories/events";
import { AppError } from "../utils/errors";

export async function list(filters: eventsRepository.EventFilters): Promise<EventListResponse> {
  const { events, total } = await eventsRepository.findAll(filters);
  return {
    events,
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getById(id: string): Promise<Event> {
  const event = await eventsRepository.findById(id);
  if (!event) throw new AppError(404, "Event not found");
  return event;
}

export async function create(input: CreateEvent, organizerId: string): Promise<Event> {
  return eventsRepository.create(input, organizerId);
}

export async function update(
  id: string,
  changes: UpdateEvent,
  requesterId: string,
): Promise<Event> {
  const event = await getById(id);
  if (event.organizerId !== requesterId) {
    throw new AppError(403, "Only the organizer can update this event");
  }
  const updated = await eventsRepository.update(id, changes);
  if (!updated) throw new AppError(404, "Event not found");
  return updated;
}

export async function remove(id: string, requesterId: string): Promise<void> {
  const event = await getById(id);
  if (event.organizerId !== requesterId) {
    throw new AppError(403, "Only the organizer can delete this event");
  }
  await eventsRepository.remove(id);
}

export async function listParticipants(id: string): Promise<User[]> {
  await getById(id);
  return eventsRepository.listParticipants(id);
}

export async function join(id: string, userId: string): Promise<void> {
  await eventsRepository.addParticipant(id, userId);
}

export async function leave(id: string, userId: string): Promise<void> {
  const event = await getById(id);
  if (event.organizerId === userId) {
    throw new AppError(403, "The organizer can't leave their own event");
  }
  await eventsRepository.removeParticipant(id, userId);
}

export async function assertParticipant(eventId: string, userId: string): Promise<void> {
  const isParticipant = await eventsRepository.isParticipant(eventId, userId);
  if (!isParticipant) {
    throw new AppError(403, "Not a participant of this event");
  }
}
