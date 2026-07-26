"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEventChat } from "@/hooks/useEventChat";
import { formatMessageTime } from "@/lib/format";
import { Button, Input } from "@/components/ui";

type EventChatProps = {
  eventId: string;
  onClose?: () => void;
};

export function EventChat({ eventId, onClose }: EventChatProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isLoadingHistory, error } = useEventChat(eventId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-black dark:text-zinc-50">Chat</h3>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex h-96 flex-col gap-3 overflow-y-auto px-4 py-3">
        {isLoadingHistory ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No messages yet — say hi.</p>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === user?.id;
            return (
              <div key={message.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {!isOwn && (
                  <span className="mb-0.5 px-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {message.userName}
                  </span>
                )}
                <div
                  className={
                    isOwn
                      ? "max-w-[80%] rounded-lg bg-black px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
                      : "max-w-[80%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-black dark:bg-zinc-800 dark:text-zinc-50"
                  }
                >
                  {message.content}
                </div>
                <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {error && <p className="px-4 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
      >
        <Input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Message..."
          className="flex-1"
        />
        <Button type="submit" disabled={!draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
