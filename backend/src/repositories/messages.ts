import type { Message } from "shared";
import { pool } from "../db/pool";

interface MessageRow {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: Date;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listByEvent(eventId: string): Promise<Message[]> {
  const result = await pool.query<MessageRow>(
    `SELECT m.id, m.event_id, m.user_id, u.name AS user_name, m.content, m.created_at
     FROM messages m
     JOIN users u ON u.id = m.user_id
     WHERE m.event_id = $1
     ORDER BY m.created_at ASC`,
    [eventId],
  );
  return result.rows.map(toMessage);
}

export async function create(eventId: string, userId: string, content: string): Promise<Message> {
  const result = await pool.query<MessageRow>(
    `WITH inserted AS (
       INSERT INTO messages (event_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, event_id, user_id, content, created_at
     )
     SELECT i.id, i.event_id, i.user_id, u.name AS user_name, i.content, i.created_at
     FROM inserted i
     JOIN users u ON u.id = i.user_id`,
    [eventId, userId, content],
  );
  return toMessage(result.rows[0]);
}
