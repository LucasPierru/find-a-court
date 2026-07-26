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

// Signed with a separate secret from access tokens, and carries a `type`
// claim so an access token can never be replayed as a refresh token (or vice
// versa) even if the secrets were ever the same. The signature lets a forged
// token be rejected before the DB is touched at all; the DB round trip in
// services/auth.ts is still what actually enforces revocation and rotation,
// since a valid signature alone doesn't mean the token hasn't already been
// used/revoked.
export function signRefreshToken(user: AuthenticatedUser): string {
  return signToken(user, "refresh", env.refreshTokenSecret, env.refreshTokenTtlDays * 24 * 60 * 60);
}

export function verifyRefreshToken(token: string): AuthenticatedUser {
  return verifyToken(token, env.refreshTokenSecret, "refresh");
}

// The DB only ever stores this hash, never the raw token, so a leaked table
// can't be replayed as a session.
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
