import type { Location } from "shared";
import { pool } from "../db/pool";

interface LocationRow {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
}

function toLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    placeId: row.place_id ?? undefined,
  };
}

export async function findAll(): Promise<Location[]> {
  const result = await pool.query<LocationRow>(
    "SELECT id, name, address, lat, lng, place_id FROM locations ORDER BY name",
  );
  return result.rows.map(toLocation);
}

export async function findById(id: string): Promise<Location | null> {
  const result = await pool.query<LocationRow>(
    "SELECT id, name, address, lat, lng, place_id FROM locations WHERE id = $1",
    [id],
  );
  return result.rows[0] ? toLocation(result.rows[0]) : null;
}

export async function create(input: {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}): Promise<Location> {
  const result = await pool.query<LocationRow>(
    `INSERT INTO locations (name, address, lat, lng, place_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, address, lat, lng, place_id`,
    [input.name, input.address, input.lat ?? null, input.lng ?? null, input.placeId ?? null],
  );
  return toLocation(result.rows[0]);
}

export async function update(
  id: string,
  changes: Partial<{ name: string; address: string; lat: number; lng: number; placeId: string }>,
): Promise<Location | null> {
  const result = await pool.query<LocationRow>(
    `UPDATE locations SET
       name = COALESCE($2, name),
       address = COALESCE($3, address),
       lat = COALESCE($4, lat),
       lng = COALESCE($5, lng),
       place_id = COALESCE($6, place_id),
       updated_at = now()
     WHERE id = $1
     RETURNING id, name, address, lat, lng, place_id`,
    [
      id,
      changes.name ?? null,
      changes.address ?? null,
      changes.lat ?? null,
      changes.lng ?? null,
      changes.placeId ?? null,
    ],
  );
  return result.rows[0] ? toLocation(result.rows[0]) : null;
}

export async function remove(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM locations WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
