import { z } from "zod";

// lat/lng are optional: a location can come from a Google Places pin (always
// has coordinates) or be typed in by hand with no map interaction.
export const locationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  placeId: z.string().optional(),
});

export type Location = z.infer<typeof locationSchema>;

export const createLocationSchema = locationSchema.omit({ id: true });
export type CreateLocation = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = createLocationSchema.partial();
export type UpdateLocation = z.infer<typeof updateLocationSchema>;
