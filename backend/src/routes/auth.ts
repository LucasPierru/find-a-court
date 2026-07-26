import { Router } from "express";
import { requestOtpSchema, verifyOtpSchema } from "shared";
import { AppError } from "../utils/errors";
import { clearRefreshTokenCookie, getRefreshTokenFromCookies, setRefreshTokenCookie } from "../utils/cookies";
import { parseOrThrow } from "../utils/parse";
import * as authService from "../services/auth";

const authRouter = Router();

authRouter.post("/otp/request", async (req, res, next) => {
  try {
    const { email } = parseOrThrow(requestOtpSchema, req.body);
    await authService.requestOtp(email);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

authRouter.post("/otp/verify", async (req, res, next) => {
  try {
    const { email, code, name } = parseOrThrow(verifyOtpSchema, req.body);
    const tokens = await authService.verifyOtp(email, code, name);
    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    res.json({ accessToken: tokens.accessToken, user: tokens.user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromCookies(req);
    if (!refreshToken) {
      throw new AppError(401, "Missing refresh token");
    }
    const tokens = await authService.refreshSession(refreshToken);
    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
    res.json({ accessToken: tokens.accessToken, user: tokens.user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromCookies(req);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshTokenCookie(res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { authRouter };
