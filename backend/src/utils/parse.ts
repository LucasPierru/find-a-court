import type { ZodType } from "zod";
import { AppError } from "./errors";

export function parseOrThrow<T>(schema: ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(400, result.error.issues[0]?.message ?? "Invalid payload");
  }
  return result.data;
}
