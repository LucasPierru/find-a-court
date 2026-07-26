import type { Message } from "shared";
import { pool } from "../db/pool";

interface MessageRow {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listByEvent(eventId: string): Promise<Message[]> {
  const result = await pool.query<MessageRow>(
    "SELECT id, event_id, user_id, content, created_at FROM messages WHERE event_id = $1 ORDER BY created_at ASC",
    [eventId],
  );
  return result.rows.map(toMessage);
}

export async function create(eventId: string, userId: string, content: string): Promise<Message> {
  const result = await pool.query<MessageRow>(
    `INSERT INTO messages (event_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, event_id, user_id, content, created_at`,
    [eventId, userId, content],
  );
  return toMessage(result.rows[0]);
}
