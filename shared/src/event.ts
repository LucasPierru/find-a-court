import { z } from "zod";
import { locationSchema } from "./location";
import { sportSlugSchema } from "./sport";

export const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sportId: sportSlugSchema,
  location: locationSchema,
  organizerId: z.string(),
  startTime: z.iso.datetime({ offset: true }),
  participantLimit: z.number().int().positive().optional(),
  participantCount: z.number().int().nonnegative(),
  isFree: z.boolean(),
  price: z.number().positive().optional(),
});

export type Event = z.infer<typeof eventSchema>;

export const createEventSchema = eventSchema
  .omit({ id: true, organizerId: true, location: true, participantCount: true })
  .extend({ location: locationSchema.omit({ id: true }) })
  .refine((event) => event.isFree || event.price !== undefined, {
    message: "Price is required for paid events",
    path: ["price"],
  });

export type CreateEvent = z.infer<typeof createEventSchema>;

export const updateEventSchema = eventSchema
  .omit({ id: true, organizerId: true, location: true, participantCount: true })
  .partial();

export type UpdateEvent = z.infer<typeof updateEventSchema>;

export const eventParticipantSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  joinedAt: z.iso.datetime({ offset: true }),
});

export type EventParticipant = z.infer<typeof eventParticipantSchema>;

export const eventListResponseSchema = z.object({
  events: z.array(eventSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type EventListResponse = z.infer<typeof eventListResponseSchema>;
