"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 46.6034, lng: 1.8883 }; // Geographic center of France
const DEFAULT_ZOOM = 5;
const USER_ZOOM = 13;

export type CourtMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

type CourtMapProps = {
  userPosition?: { lat: number; lng: number } | null;
  courts?: CourtMarker[];
};

export function CourtMap({ userPosition, courts = [] }: CourtMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        Set <code className="mx-1 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in{" "}
        <code className="mx-1 font-mono">frontend/.env.local</code> to display the map.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        key={userPosition ? `${userPosition.lat}-${userPosition.lng}` : "default"}
        className="h-full w-full rounded-lg"
        defaultCenter={userPosition ?? DEFAULT_CENTER}
        defaultZoom={userPosition ? USER_ZOOM : DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {userPosition && <Marker position={userPosition} title="Your location" />}
        {courts.map((court) => (
          <Marker
            key={court.id}
            position={{ lat: court.lat, lng: court.lng }}
            title={court.name}
          />
        ))}
      </Map>
    </APIProvider>
  );
}
