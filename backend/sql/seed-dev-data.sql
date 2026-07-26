INSERT INTO users (id, name, email) VALUES
  ('7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b', 'Camille Dubois', 'camille.dubois@example.com'),
  ('4eed5e68-a002-4f28-9ff2-927c860b75ec', 'Yanis Haddad', 'yanis.haddad@example.com'),
  ('26c1ef08-b191-4e8a-b289-21fbc119d1f6', 'Lea Moreau', 'lea.moreau@example.com'),
  ('680138d7-0e17-4ca8-84e1-8a4e6710f8f9', 'Marc Petit', 'marc.petit@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, address, lat, lng) VALUES
  ('984072af-c4fb-4e61-a94b-bf2e0b630203', 'Jarry Park Tennis Complex', '285 Rue Gary-Carter, Montreal, QC H2R 2X9', 45.5378, -73.6197),
  ('8f46396e-f63f-4712-9158-0e6e885aa383', 'Terrain de soccer - Parc Jeanne-Mance', '1200 Avenue du Parc, Montreal, QC H2W 1S5', 45.5152, -73.5895),
  ('3cee73af-9ea1-4dfe-b7d3-f94b646de46c', 'Parc Laurier - Terrain de basketball', '1381 Avenue Laurier E, Montreal, QC H2J 1H4', 45.5227, -73.5827),
  ('ef84e4e6-ed38-4d57-997d-6a11eb3e3a0d', 'Padel Griffintown', '1000 Rue Wellington, Montreal, QC H3C 1T7', 45.4925, -73.5661),
  ('255a1943-84fd-4dfa-bf8c-9e9a44210be2', 'Plage de l''Horloge - Beach Volleyball', 'Vieux-Port de Montreal, Montreal, QC H2Y 2E2', 45.5075, -73.5493),
  ('28e110a3-9ba8-4a18-8ba1-1d02a96e208a', 'Centre Badminton Montreal', '4545 Avenue Pierre-De Coubertin, Montreal, QC H1V 0B2', 45.5605, -73.5518),
  ('bc964e4d-cc7c-4d83-be24-29d702b39263', 'Club de Tennis de Table de Montreal', '6800 Rue Saint-Urbain, Montreal, QC H2S 3H9', 45.5335, -73.6119)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng;

INSERT INTO events (id, title, description, sport_id, location_id, organizer_id, start_time, participant_limit, is_free, price) VALUES
  ('85e4402f-1a0a-425e-9b10-97d872340136', 'Sunday morning tennis doubles', 'Friendly doubles, all levels welcome. Bring your own racket.', 'tennis', '984072af-c4fb-4e61-a94b-bf2e0b630203', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b', '2026-09-06T09:00:00Z', 4, true, NULL),
  ('ac363fd7-6a10-44c8-8030-9e06accb660b', '5-a-side football', 'Court reserved for the evening, cost split between players.', 'football', '8f46396e-f63f-4712-9158-0e6e885aa383', '4eed5e68-a002-4f28-9ff2-927c860b75ec', '2026-09-08T19:00:00Z', 10, false, 8),
  ('6d06ba7f-61b6-4518-bf88-1682253d80d4', 'Pickup basketball', NULL, 'basketball', '3cee73af-9ea1-4dfe-b7d3-f94b646de46c', '26c1ef08-b191-4e8a-b289-21fbc119d1f6', '2026-09-10T18:30:00Z', NULL, true, NULL),
  ('e6f4b8bc-895d-484c-a000-3a83b5fc3382', 'Padel for beginners', 'Court booked, looking for 3 more players to split the cost.', 'padel', 'ef84e4e6-ed38-4d57-997d-6a11eb3e3a0d', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b', '2026-09-12T17:00:00Z', 4, false, 12),
  ('d9ed42b4-0fc2-4cf0-8c3d-51ed0bdc3320', 'Volleyball at the beach court', NULL, 'volleyball', '255a1943-84fd-4dfa-bf8c-9e9a44210be2', '4eed5e68-a002-4f28-9ff2-927c860b75ec', '2026-09-14T16:00:00Z', 12, true, NULL),
  ('3456bcd5-bec0-4e1c-8719-6a209ed4aaf4', 'Badminton evening session', NULL, 'badminton', '28e110a3-9ba8-4a18-8ba1-1d02a96e208a', '26c1ef08-b191-4e8a-b289-21fbc119d1f6', '2026-09-16T20:00:00Z', 8, false, 5),
  ('67ca415e-d06f-497b-befd-ed3795305555', 'Table tennis club night', NULL, 'table-tennis', 'bc964e4d-cc7c-4d83-be24-29d702b39263', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b', '2026-09-18T19:30:00Z', NULL, true, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sport_id = EXCLUDED.sport_id,
  location_id = EXCLUDED.location_id,
  organizer_id = EXCLUDED.organizer_id,
  start_time = EXCLUDED.start_time,
  participant_limit = EXCLUDED.participant_limit,
  is_free = EXCLUDED.is_free,
  price = EXCLUDED.price;

INSERT INTO event_participants (event_id, user_id) VALUES
  ('85e4402f-1a0a-425e-9b10-97d872340136', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b'),
  ('85e4402f-1a0a-425e-9b10-97d872340136', '4eed5e68-a002-4f28-9ff2-927c860b75ec'),
  ('ac363fd7-6a10-44c8-8030-9e06accb660b', '4eed5e68-a002-4f28-9ff2-927c860b75ec'),
  ('ac363fd7-6a10-44c8-8030-9e06accb660b', '26c1ef08-b191-4e8a-b289-21fbc119d1f6'),
  ('ac363fd7-6a10-44c8-8030-9e06accb660b', '680138d7-0e17-4ca8-84e1-8a4e6710f8f9'),
  ('6d06ba7f-61b6-4518-bf88-1682253d80d4', '26c1ef08-b191-4e8a-b289-21fbc119d1f6'),
  ('e6f4b8bc-895d-484c-a000-3a83b5fc3382', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b'),
  ('e6f4b8bc-895d-484c-a000-3a83b5fc3382', '680138d7-0e17-4ca8-84e1-8a4e6710f8f9'),
  ('d9ed42b4-0fc2-4cf0-8c3d-51ed0bdc3320', '4eed5e68-a002-4f28-9ff2-927c860b75ec'),
  ('3456bcd5-bec0-4e1c-8719-6a209ed4aaf4', '26c1ef08-b191-4e8a-b289-21fbc119d1f6'),
  ('67ca415e-d06f-497b-befd-ed3795305555', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b')
ON CONFLICT DO NOTHING;

INSERT INTO messages (id, event_id, user_id, content) VALUES
  ('25b139f5-ee95-4a20-b6db-5dc5d042fa60', '85e4402f-1a0a-425e-9b10-97d872340136', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b', 'Hey! Looking forward to Sunday, see you at the club around 8:45?'),
  ('6b57dd4e-eb50-48eb-8d9b-0ae9a458cf3d', '85e4402f-1a0a-425e-9b10-97d872340136', '4eed5e68-a002-4f28-9ff2-927c860b75ec', 'Sounds good, I''ll bring an extra racket in case anyone needs one'),
  ('2641b498-2431-470e-8d97-5b21b959335e', '85e4402f-1a0a-425e-9b10-97d872340136', '7c20ca09-a5e9-4fa7-9a7a-364ee0243a8b', 'Perfect, see you there!')
ON CONFLICT (id) DO NOTHING;
