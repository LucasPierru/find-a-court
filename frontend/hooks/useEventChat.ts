"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS, type Message } from "shared";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useEventChat(eventId: string) {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    apiFetch<Message[]>(`/v1/events/${eventId}/messages`, { accessToken })
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load message history");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingHistory(false);
      });

    const socket = io(SOCKET_URL, { auth: { token: accessToken } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit(SOCKET_EVENTS.EVENT_JOIN, { eventId });
    });

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
      setMessages((current) => [...current, message]);
    });

    socket.on(SOCKET_EVENTS.SOCKET_ERROR, (payload: { message: string }) => {
      setError(payload.message);
    });

    socket.on("connect_error", (connectError: Error) => {
      setError(connectError.message);
    });

    return () => {
      cancelled = true;
      socket.emit(SOCKET_EVENTS.EVENT_LEAVE, { eventId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, accessToken]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !socketRef.current) return;
      socketRef.current.emit(SOCKET_EVENTS.MESSAGE_SEND, { eventId, content: trimmed });
    },
    [eventId],
  );

  return { messages, sendMessage, isLoadingHistory, error };
}
