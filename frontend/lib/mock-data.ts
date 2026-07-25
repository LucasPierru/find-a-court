import type { Event, User } from "shared";

// Temporary in-memory data standing in for the backend, which has no
// events/users endpoints yet. Shaped to match the `shared` schemas so the
// data-access functions in `./events` can be swapped for real fetches later
// without touching call sites.

export const mockUsers: User[] = [
  { id: "user-1", name: "Camille Dubois", email: "camille.dubois@example.com" },
  { id: "user-2", name: "Yanis Haddad", email: "yanis.haddad@example.com" },
  { id: "user-3", name: "Lea Moreau", email: "lea.moreau@example.com" },
];

export const mockEvents: Event[] = [
  {
    id: "event-1",
    title: "Sunday morning tennis doubles",
    description: "Friendly doubles, all levels welcome. Bring your own racket.",
    sportId: "tennis",
    location: {
      id: "loc-1",
      name: "Tennis Club de Boulogne",
      address: "29 Rue du Camp Canadien, 92100 Boulogne-Billancourt",
      lat: 48.8358,
      lng: 2.2447,
    },
    organizerId: "user-1",
    startTime: "2026-07-27T09:00:00Z",
    participantLimit: 4,
    isFree: true,
  },
  {
    id: "event-2",
    title: "5-a-side football",
    description: "Court reserved for the evening, cost split between players.",
    sportId: "football",
    location: {
      id: "loc-2",
      name: "Stade Pershing",
      address: "9 Rue du Commandant Guilbaud, 75016 Paris",
      lat: 48.8639,
      lng: 2.2626,
    },
    organizerId: "user-2",
    startTime: "2026-07-28T19:00:00Z",
    participantLimit: 10,
    isFree: false,
    price: 8,
  },
  {
    id: "event-3",
    title: "Pickup basketball",
    sportId: "basketball",
    location: {
      id: "loc-3",
      name: "City Stade Python Duvernois",
      address: "17 Rue Python, 75020 Paris",
      lat: 48.8663,
      lng: 2.4083,
    },
    organizerId: "user-3",
    startTime: "2026-07-29T18:30:00Z",
    isFree: true,
  },
  {
    id: "event-4",
    title: "Padel for beginners",
    description: "Court booked, looking for 3 more players to split the cost.",
    sportId: "padel",
    location: {
      id: "loc-4",
      name: "Padel Club Paris 15",
      address: "2 Rue Fizeau, 75015 Paris",
      lat: 48.8362,
      lng: 2.2874,
    },
    organizerId: "user-1",
    startTime: "2026-08-01T17:00:00Z",
    participantLimit: 4,
    isFree: false,
    price: 12,
  },
  {
    id: "event-5",
    title: "Volleyball at the beach court",
    sportId: "volleyball",
    location: {
      id: "loc-5",
      name: "Beach Volley Paris - Bercy",
      address: "8 Boulevard de Bercy, 75012 Paris",
      lat: 48.8375,
      lng: 2.3822,
    },
    organizerId: "user-2",
    startTime: "2026-08-02T16:00:00Z",
    participantLimit: 12,
    isFree: true,
  },
  {
    id: "event-6",
    title: "Badminton evening session",
    sportId: "badminton",
    location: {
      id: "loc-6",
      name: "Gymnase Elisabeth",
      address: "7-9 Avenue de la Porte de Vanves, 75014 Paris",
      lat: 48.8265,
      lng: 2.3057,
    },
    organizerId: "user-3",
    startTime: "2026-08-03T20:00:00Z",
    participantLimit: 8,
    isFree: false,
    price: 5,
  },
  {
    id: "event-7",
    title: "Table tennis club night",
    sportId: "table-tennis",
    location: {
      id: "loc-7",
      name: "Club Athlétique des Sports Généraux",
      address: "85 Rue de Vaugirard, 75006 Paris",
      lat: 48.848,
      lng: 2.3236,
    },
    organizerId: "user-1",
    startTime: "2026-08-05T19:30:00Z",
    isFree: true,
  },
];
