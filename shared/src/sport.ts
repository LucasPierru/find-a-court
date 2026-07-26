import { z } from "zod";

// `placesQuery` is the free-text query used for Google Places text search —
// Places has no granular "tennis_court"/"padel_court" place types, so a
// per-sport keyword is the practical way to find courts/pitches for a sport.
const SPORT_DEFINITIONS = [
  { id: "tennis", name: "Tennis", placesQuery: "tennis court", icon: "🎾" },
  { id: "padel", name: "Padel", placesQuery: "padel court", icon: "🥎" },
  { id: "football", name: "Football", placesQuery: "football pitch", icon: "⚽" },
  { id: "basketball", name: "Basketball", placesQuery: "basketball court", icon: "🏀" },
  { id: "volleyball", name: "Volleyball", placesQuery: "volleyball court", icon: "🏐" },
  { id: "badminton", name: "Badminton", placesQuery: "badminton court", icon: "🏸" },
  {
    id: "table-tennis",
    name: "Table Tennis",
    placesQuery: "table tennis club",
    icon: "🏓",
  },
  { id: "squash", name: "Squash", placesQuery: "squash court", icon: "🎯" },
] as const;

export const sportSlugSchema = z.enum(
  SPORT_DEFINITIONS.map((sport) => sport.id) as [string, ...string[]],
);
export type SportSlug = z.infer<typeof sportSlugSchema>;

export const sportSchema = z.object({
  id: sportSlugSchema,
  name: z.string(),
  placesQuery: z.string(),
  icon: z.string(),
});
export type Sport = z.infer<typeof sportSchema>;

export const SPORTS: readonly Sport[] = SPORT_DEFINITIONS;

export const createSportSchema = sportSchema;
export type CreateSport = z.infer<typeof createSportSchema>;

export const updateSportSchema = sportSchema.omit({ id: true }).partial();
export type UpdateSport = z.infer<typeof updateSportSchema>;

export function getSportBySlug(slug: string): Sport | undefined {
  return SPORTS.find((sport) => sport.id === slug);
}
