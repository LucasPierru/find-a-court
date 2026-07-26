import type { Message } from "shared";
import * as messagesRepository from "../repositories/messages";
import * as eventsService from "./events";

export async function listForEvent(eventId: string, requesterId: string): Promise<Message[]> {
  await eventsService.getById(eventId);
  await eventsService.assertParticipant(eventId, requesterId);
  return messagesRepository.listByEvent(eventId);
}

export async function send(eventId: string, userId: string, content: string): Promise<Message> {
  await eventsService.assertParticipant(eventId, userId);
  return messagesRepository.create(eventId, userId, content);
}
