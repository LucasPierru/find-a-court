import type { User } from "shared";
import { pool } from "../db/pool";

interface UserRow {
  id: string;
  name: string;
  email: string;
}

function toUser(row: UserRow): User {
  return { id: row.id, name: row.name, email: row.email };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>("SELECT id, name, email FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>("SELECT id, name, email FROM users WHERE id = $1", [id]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function createUser(name: string, email: string): Promise<User> {
  const result = await pool.query<UserRow>(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email",
    [name, email],
  );
  return toUser(result.rows[0]);
}

export async function createOtpCode(email: string, code: string, expiresAt: Date): Promise<void> {
  await pool.query("INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)", [
    email,
    code,
    expiresAt,
  ]);
}

// Consumes the newest still-valid, unconsumed code for the email in one
// atomic UPDATE so a code can't be replayed after it's been used once.
export async function consumeLatestOtpCode(email: string, code: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE otp_codes
     SET consumed_at = now()
     WHERE id = (
       SELECT id FROM otp_codes
       WHERE email = $1 AND code = $2 AND consumed_at IS NULL AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1
     )
     RETURNING id`,
    [email, code],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function storeRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt],
  );
}

export async function findValidRefreshToken(
  tokenHash: string,
): Promise<{ id: string; userId: string } | null> {
  const result = await pool.query<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [tokenHash],
  );
  return result.rows[0] ? { id: result.rows[0].id, userId: result.rows[0].user_id } : null;
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await pool.query(
    "UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL",
    [tokenHash],
  );
}
