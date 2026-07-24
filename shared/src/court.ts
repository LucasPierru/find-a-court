import { z } from "zod";

// Example shared contract — replace with real fields as the domain takes shape.
export const courtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export type Court = z.infer<typeof courtSchema>;
