import type { Sport, SportSlug } from "shared";
import { pool } from "../db/pool";

interface SportRow {
  id: string;
  name: string;
  places_query: string;
  icon: string;
}

function toSport(row: SportRow): Sport {
  return { id: row.id as SportSlug, name: row.name, placesQuery: row.places_query, icon: row.icon };
}

export async function findAll(): Promise<Sport[]> {
  const result = await pool.query<SportRow>(
    "SELECT id, name, places_query, icon FROM sports ORDER BY name",
  );
  return result.rows.map(toSport);
}

export async function findById(id: string): Promise<Sport | null> {
  const result = await pool.query<SportRow>(
    "SELECT id, name, places_query, icon FROM sports WHERE id = $1",
    [id],
  );
  return result.rows[0] ? toSport(result.rows[0]) : null;
}

export async function create(sport: {
  id: string;
  name: string;
  placesQuery: string;
  icon: string;
}): Promise<Sport> {
  const result = await pool.query<SportRow>(
    `INSERT INTO sports (id, name, places_query, icon)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, places_query, icon`,
    [sport.id, sport.name, sport.placesQuery, sport.icon],
  );
  return toSport(result.rows[0]);
}

export async function update(
  id: string,
  changes: Partial<{ name: string; placesQuery: string; icon: string }>,
): Promise<Sport | null> {
  const result = await pool.query<SportRow>(
    `UPDATE sports SET
       name = COALESCE($2, name),
       places_query = COALESCE($3, places_query),
       icon = COALESCE($4, icon),
       updated_at = now()
     WHERE id = $1
     RETURNING id, name, places_query, icon`,
    [id, changes.name ?? null, changes.placesQuery ?? null, changes.icon ?? null],
  );
  return result.rows[0] ? toSport(result.rows[0]) : null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM sports WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
