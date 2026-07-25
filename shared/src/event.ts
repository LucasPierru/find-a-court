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
  isFree: z.boolean(),
  price: z.number().positive().optional(),
});

export type Event = z.infer<typeof eventSchema>;

export const createEventInputSchema = eventSchema
  .omit({ id: true, organizerId: true, location: true })
  .extend({ location: locationSchema.omit({ id: true }) })
  .refine((event) => event.isFree || event.price !== undefined, {
    message: "Price is required for paid events",
    path: ["price"],
  });

export type CreateEventInput = z.infer<typeof createEventInputSchema>;
