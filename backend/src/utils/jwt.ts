import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errors";

type TokenType = "access" | "refresh";

interface TokenPayload {
  sub: string;
  email: string;
  type: TokenType;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

function signToken(
  user: AuthenticatedUser,
  type: TokenType,
  secret: string,
  expiresInSeconds: number,
): string {
  const payload: TokenPayload = { sub: user.id, email: user.email, type };
  return jwt.sign(payload, secret, { expiresIn: expiresInSeconds });
}

function verifyToken(token: string, secret: string, expectedType: TokenType): AuthenticatedUser {
  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      (decoded as TokenPayload).type !== expectedType ||
      typeof (decoded as TokenPayload).sub !== "string" ||
      typeof (decoded as TokenPayload).email !== "string"
    ) {
      throw new AppError(401, "Invalid or expired token");
    }

    return { id: (decoded as TokenPayload).sub, email: (decoded as TokenPayload).email };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "Invalid or expired token");
  }
}

export function signAccessToken(user: AuthenticatedUser): string {
  return signToken(user, "access", env.accessTokenSecret, env.accessTokenTtlSeconds);
}

export function verifyAccessToken(token: string): AuthenticatedUser {
  return verifyToken(token, env.accessTokenSecret, "access");
}

export function signRefreshToken(user: AuthenticatedUser): string {
  return signToken(user, "refresh", env.refreshTokenSecret, env.refreshTokenTtlDays * 24 * 60 * 60);
}

export function verifyRefreshToken(token: string): AuthenticatedUser {
  return verifyToken(token, env.refreshTokenSecret, "refresh");
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
