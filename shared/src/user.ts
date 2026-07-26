import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.email(),
});

export type User = z.infer<typeof userSchema>;

// Auth is passwordless: a one-time code is emailed to the user. Verifying it
// logs the user in, creating the account on first verification (hence the
// optional `name`, only required the first time a given email verifies).
export const requestOtpSchema = z.object({
  email: z.email(),
});

export type RequestOtp = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
  name: z.string().min(1, "Name is required").optional(),
});

export type VerifyOtp = z.infer<typeof verifyOtpSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
