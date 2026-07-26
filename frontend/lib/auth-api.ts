import type { AuthResponse } from "shared";
import { apiFetch } from "./api";

export async function requestOtp(email: string): Promise<void> {
  await apiFetch<void>("/v1/auth/otp/request", { method: "POST", body: { email } });
}

export async function verifyOtp(email: string, code: string, name?: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/otp/verify", {
    method: "POST",
    body: { email, code, name },
  });
}

export async function refreshSession(): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/v1/auth/refresh", { method: "POST" });
}

export async function logoutSession(): Promise<void> {
  await apiFetch<void>("/v1/auth/logout", { method: "POST" });
}
