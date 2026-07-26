import type { CreateEvent, Event, UpdateEvent, User } from "shared";
import { pool } from "../db/pool";
import { AppError } from "../utils/errors";

const EVENT_COLUMNS = `
  e.id, e.title, e.description, e.sport_id, e.organizer_id, e.start_time,
  e.participant_limit, e.is_free, e.price,
  (SELECT COUNT(*) FROM event_participants ep WHERE ep.event_id = e.id) AS participant_count,
  l.id AS location_id, l.name AS location_name, l.address AS location_address,
  l.lat AS location_lat, l.lng AS location_lng, l.place_id AS location_place_id
`;

interface EventRow {
  id: string;
  title: string;
  description: string | null;
  sport_id: string;
  organizer_id: string;
  start_time: Date;
  participant_limit: number | null;
  is_free: boolean;
  price: string | null;
  participant_count: string;
  location_id: string;
  location_name: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
}

function toEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    sportId: row.sport_id as Event["sportId"],
    organizerId: row.organizer_id,
    startTime: row.start_time.toISOString(),
    participantLimit: row.participant_limit ?? undefined,
    participantCount: Number(row.participant_count),
    isFree: row.is_free,
    price: row.price !== null ? Number(row.price) : undefined,
    location: {
      id: row.location_id,
      name: row.location_name,
      address: row.location_address,
      lat: row.location_lat ?? undefined,
      lng: row.location_lng ?? undefined,
      placeId: row.location_place_id ?? undefined,
    },
  };
}

export interface EventFilters {
  sportId?: string;
  upcomingOnly?: boolean;
  keyword?: string;
  location?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedEvents {
  events: Event[];
  total: number;
}

export async function findAll(filters: EventFilters): Promise<PaginatedEvents> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.sportId) {
    params.push(filters.sportId);
    conditions.push(`e.sport_id = $${params.length}`);
  }
  if (filters.upcomingOnly) {
    conditions.push(`e.start_time >= now()`);
  }
  if (filters.keyword) {
    params.push(`%${filters.keyword}%`);
    conditions.push(`(e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`);
  }
  if (filters.location) {
    params.push(`%${filters.location}%`);
    conditions.push(`(l.name ILIKE $${params.length} OR l.address ILIKE $${params.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (filters.page - 1) * filters.pageSize;
  params.push(filters.pageSize, offset);
  const limitParam = params.length - 1;
  const offsetParam = params.length;

  const result = await pool.query<EventRow & { total_count: string }>(
    `SELECT ${EVENT_COLUMNS}, COUNT(*) OVER() AS total_count
     FROM events e JOIN locations l ON l.id = e.location_id
     ${where}
     ORDER BY e.start_time ASC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    params,
  );

  const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
  return { events: result.rows.map(toEvent), total };
}

export async function findById(id: string): Promise<Event | null> {
  const result = await pool.query<EventRow>(
    `SELECT ${EVENT_COLUMNS} FROM events e JOIN locations l ON l.id = e.location_id WHERE e.id = $1`,
    [id],
  );
  return result.rows[0] ? toEvent(result.rows[0]) : null;
}

export async function create(input: CreateEvent, organizerId: string): Promise<Event> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const locationResult = await client.query<{ id: string }>(
      `INSERT INTO locations (name, address, lat, lng, place_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        input.location.name,
        input.location.address,
        input.location.lat ?? null,
        input.location.lng ?? null,
        input.location.placeId ?? null,
      ],
    );
    const locationId = locationResult.rows[0].id;

    const eventResult = await client.query<{ id: string }>(
      `INSERT INTO events (title, description, sport_id, location_id, organizer_id, start_time, participant_limit, is_free, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        input.title,
        input.description ?? null,
        input.sportId,
        locationId,
        organizerId,
        input.startTime,
        input.participantLimit ?? null,
        input.isFree,
        input.price ?? null,
      ],
    );
    const eventId = eventResult.rows[0].id;

    await client.query("INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2)", [
      eventId,
      organizerId,
    ]);

    await client.query("COMMIT");
    const created = await findById(eventId);
    if (!created) throw new Error("Failed to load event after creation");
    return created;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function update(id: string, changes: UpdateEvent): Promise<Event | null> {
  const result = await pool.query(
    `UPDATE events SET
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       sport_id = COALESCE($4, sport_id),
       start_time = COALESCE($5, start_time),
       participant_limit = COALESCE($6, participant_limit),
       is_free = COALESCE($7, is_free),
       price = COALESCE($8, price),
       updated_at = now()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      changes.title ?? null,
      changes.description ?? null,
      changes.sportId ?? null,
      changes.startTime ?? null,
      changes.participantLimit ?? null,
      changes.isFree ?? null,
      changes.price ?? null,
    ],
  );
  if (result.rowCount === 0) return null;
  return findById(id);
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM events WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function isParticipant(eventId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    "SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2",
    [eventId, userId],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function listParticipants(eventId: string): Promise<User[]> {
  const result = await pool.query<{ id: string; name: string; email: string }>(
    `SELECT u.id, u.name, u.email
     FROM event_participants ep
     JOIN users u ON u.id = ep.user_id
     WHERE ep.event_id = $1
     ORDER BY ep.joined_at ASC`,
    [eventId],
  );
  return result.rows.map((row) => ({ id: row.id, name: row.name, email: row.email }));
}

export async function addParticipant(eventId: string, userId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const eventResult = await client.query<{ participant_limit: number | null }>(
      "SELECT participant_limit FROM events WHERE id = $1 FOR UPDATE",
      [eventId],
    );
    if (eventResult.rowCount === 0) {
      throw new AppError(404, "Event not found");
    }

    const { participant_limit: participantLimit } = eventResult.rows[0];
    if (participantLimit !== null) {
      const countResult = await client.query<{ count: string }>(
        "SELECT COUNT(*) FROM event_participants WHERE event_id = $1",
        [eventId],
      );
      if (Number(countResult.rows[0].count) >= participantLimit) {
        throw new AppError(409, "Event is full");
      }
    }

    await client.query(
      "INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [eventId, userId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeParticipant(eventId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2",
    [eventId, userId],
  );
  return (result.rowCount ?? 0) > 0;
}
