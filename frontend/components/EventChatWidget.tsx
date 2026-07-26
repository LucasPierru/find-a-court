"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { EventChat } from "@/components/EventChat";
import { cn } from "@/components/ui";

type EventChatWidgetProps = {
  eventId: string;
};

export function EventChatWidget({ eventId }: EventChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md origin-bottom-right transition-all duration-200 ease-out",
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <EventChat eventId={eventId} onClose={() => setIsOpen(false)} />
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open event chat"
        className={cn(
          "fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 ease-out hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200",
          isOpen ? "pointer-events-none scale-75 opacity-0" : "scale-100 opacity-100",
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
