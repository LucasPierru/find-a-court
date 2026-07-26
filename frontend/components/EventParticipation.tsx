"use client";

import { useState } from "react";
import type { User } from "shared";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui";
import { EventChatWidget } from "@/components/EventChatWidget";

type EventParticipationProps = {
  eventId: string;
  organizerId: string;
  initialParticipants: User[];
};

export function EventParticipation({
  eventId,
  organizerId,
  initialParticipants,
}: EventParticipationProps) {
  const { status, user, accessToken, openAuthModal } = useAuth();
  const [participants, setParticipants] = useState(initialParticipants);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOrganizer = user?.id === organizerId;
  const isParticipant = user ? participants.some((participant) => participant.id === user.id) : false;

  async function handleJoin(): Promise<void> {
    if (!user || !accessToken) return;
    setError(null);
    setIsPending(true);
    try {
      await apiFetch<void>(`/v1/events/${eventId}/join`, { method: "POST", accessToken });
      setParticipants((current) => [...current, user]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  async function handleLeave(): Promise<void> {
    if (!user || !accessToken) return;
    setError(null);
    setIsPending(true);
    try {
      await apiFetch<void>(`/v1/events/${eventId}/join`, { method: "DELETE", accessToken });
      setParticipants((current) => current.filter((participant) => participant.id !== user.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Participants</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {participants.length === 0
              ? "No one has joined yet."
              : participants.map((participant) => participant.name).join(", ")}
          </p>
        </div>

        {status === "authenticated" && isOrganizer ? (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">You&apos;re the organizer</span>
        ) : status === "authenticated" && isParticipant ? (
          <Button type="button" variant="outline" onClick={handleLeave} disabled={isPending}>
            Leave
          </Button>
        ) : status === "authenticated" ? (
          <Button type="button" onClick={handleJoin} disabled={isPending}>
            Join
          </Button>
        ) : status === "unauthenticated" ? (
          <button
            type="button"
            onClick={openAuthModal}
            className="text-sm font-medium text-black underline underline-offset-2 dark:text-zinc-50"
          >
            Sign in to join
          </button>
        ) : null}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {isParticipant && <EventChatWidget key={eventId} eventId={eventId} />}
    </div>
  );
}
