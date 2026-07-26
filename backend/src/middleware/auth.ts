import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifyAccessToken, type AuthenticatedUser } from "../utils/jwt";

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    next(new AppError(401, "Missing access token"));
    return;
  }

  try {
    (req as AuthenticatedRequest).user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new AppError(401, "Authentication required");
  }
  return user;
}
