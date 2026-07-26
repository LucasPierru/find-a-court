import type { Server as HttpServer } from "node:http";
import {
  eventRoomPayloadSchema,
  messageSendPayloadSchema,
  SOCKET_EVENTS,
  type MessageNewPayload,
} from "shared";
import { Server, type Socket } from "socket.io";
import { env } from "../config/env";
import * as eventsService from "../services/events";
import * as messagesService from "../services/messages";
import { verifyAccessToken } from "../utils/jwt";

function roomName(eventId: string): string {
  return `event:${eventId}`;
}

function emitError(socket: Socket, err: unknown, fallback: string): void {
  const message = err instanceof Error ? err.message : fallback;
  socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message });
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigin, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("Missing access token"));
      return;
    }
    try {
      const user = verifyAccessToken(token);
      socket.data.userId = user.id;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("Invalid or expired access token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;

    socket.on(SOCKET_EVENTS.EVENT_JOIN, async (payload: unknown) => {
      const parsed = eventRoomPayloadSchema.safeParse(payload);
      if (!parsed.success) {
        emitError(socket, null, "Invalid payload");
        return;
      }

      try {
        await eventsService.assertParticipant(parsed.data.eventId, userId);
        await socket.join(roomName(parsed.data.eventId));
      } catch (err) {
        emitError(socket, err, "Unable to join event");
      }
    });

    socket.on(SOCKET_EVENTS.EVENT_LEAVE, async (payload: unknown) => {
      const parsed = eventRoomPayloadSchema.safeParse(payload);
      if (!parsed.success) return;
      await socket.leave(roomName(parsed.data.eventId));
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (payload: unknown) => {
      const parsed = messageSendPayloadSchema.safeParse(payload);
      if (!parsed.success) {
        emitError(socket, null, "Invalid message");
        return;
      }

      try {
        const { eventId, content } = parsed.data;
        const message = await messagesService.send(eventId, userId, content);
        io.to(roomName(eventId)).emit(SOCKET_EVENTS.MESSAGE_NEW, message satisfies MessageNewPayload);
      } catch (err) {
        emitError(socket, err, "Unable to send message");
      }
    });
  });

  return io;
}
