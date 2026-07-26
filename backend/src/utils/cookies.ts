import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_PATH = "/v1/auth";

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    path: REFRESH_TOKEN_PATH,
  };
}

export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, { ...baseCookieOptions(), expires: expiresAt });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions());
}

export function getRefreshTokenFromCookies(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
}
