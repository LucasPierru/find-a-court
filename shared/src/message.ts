import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  content: z.string().min(1),
  createdAt: z.iso.datetime({ offset: true }),
});

export type Message = z.infer<typeof messageSchema>;

export const createMessageSchema = z.object({
  eventId: z.string(),
  content: z.string().min(1, "Message can't be empty").max(2000, "Message is too long"),
});

export type CreateMessage = z.infer<typeof createMessageSchema>;
