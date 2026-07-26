INSERT INTO sports (id, name, places_query, icon)
VALUES
  ('tennis', 'Tennis', 'tennis court', '🎾'),
  ('padel', 'Padel', 'padel court', '🥎'),
  ('football', 'Football', 'football pitch', '⚽'),
  ('basketball', 'Basketball', 'basketball court', '🏀'),
  ('volleyball', 'Volleyball', 'volleyball court', '🏐'),
  ('badminton', 'Badminton', 'badminton court', '🏸'),
  ('table-tennis', 'Table Tennis', 'table tennis club', '🏓'),
  ('squash', 'Squash', 'squash court', '🎯')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    places_query = EXCLUDED.places_query,
    icon = EXCLUDED.icon;
