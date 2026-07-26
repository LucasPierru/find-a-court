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

export async function findById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>("SELECT id, name, email FROM users WHERE id = $1", [id]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function updateName(id: string, name: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    "UPDATE users SET name = $2, updated_at = now() WHERE id = $1 RETURNING id, name, email",
    [id, name],
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
