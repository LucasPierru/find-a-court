import { z } from "zod";
import { messageSchema } from "./message";

// Chat is scoped to an event's room: clients join with `event:join`, send
// with `message:send`, and everyone in the room (including the sender) gets
// the persisted message back via `message:new`.
export const SOCKET_EVENTS = {
  EVENT_JOIN: "event:join",
  EVENT_LEAVE: "event:leave",
  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  SOCKET_ERROR: "socket:error",
} as const;

export const eventRoomPayloadSchema = z.object({
  eventId: z.string(),
});

export type EventRoomPayload = z.infer<typeof eventRoomPayloadSchema>;

export const messageSendPayloadSchema = z.object({
  eventId: z.string(),
  content: z.string().min(1, "Message can't be empty").max(2000, "Message is too long"),
});

export type MessageSendPayload = z.infer<typeof messageSendPayloadSchema>;

export const messageNewPayloadSchema = messageSchema;

export type MessageNewPayload = z.infer<typeof messageNewPayloadSchema>;

export const socketErrorPayloadSchema = z.object({
  message: z.string(),
});

export type SocketErrorPayload = z.infer<typeof socketErrorPayloadSchema>;
