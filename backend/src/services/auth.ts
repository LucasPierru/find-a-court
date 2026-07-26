import type { User } from "shared";
import { env } from "../config/env";
import * as authRepository from "../repositories/auth";
import { AppError } from "../utils/errors";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: User;
}

export async function requestOtp(email: string): Promise<void> {
  const expiresAt = new Date(Date.now() + env.otpTtlMinutes * 60_000);
  await authRepository.createOtpCode(email, env.otpStaticCode, expiresAt);
}

export async function verifyOtp(email: string, code: string, name?: string): Promise<AuthTokens> {
  const isValid = await authRepository.consumeLatestOtpCode(email, code);
  if (!isValid) {
    throw new AppError(401, "Invalid or expired code");
  }

  let user = await authRepository.findUserByEmail(email);
  if (!user) {
    if (!name) {
      throw new AppError(400, "Name is required to create an account");
    }
    user = await authRepository.createUser(name, email);
  }

  return issueTokens(user);
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(refreshToken);

  const tokenHash = hashRefreshToken(refreshToken);
  const existing = await authRepository.findValidRefreshToken(tokenHash);
  if (!existing || existing.userId !== payload.id) {
    throw new AppError(401, "Invalid or expired refresh token");
  }
  await authRepository.revokeRefreshToken(tokenHash);

  const user = await authRepository.findUserById(existing.userId);
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  return issueTokens(user);
}

export async function logout(refreshToken: string): Promise<void> {
  await authRepository.revokeRefreshToken(hashRefreshToken(refreshToken));
}

async function issueTokens(user: User): Promise<AuthTokens> {
  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });
  const refreshTokenExpiresAt = new Date(
    Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  );
  await authRepository.storeRefreshToken(
    user.id,
    hashRefreshToken(refreshToken),
    refreshTokenExpiresAt,
  );
  return { accessToken, refreshToken, refreshTokenExpiresAt, user };
}
