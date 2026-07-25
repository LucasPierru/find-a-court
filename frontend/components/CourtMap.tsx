"use client";

import { useMemo, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { SPORTS, getSportBySlug, type SportSlug } from "shared";
import { SportMarkersLayer } from "@/components/SportMarkersLayer";

const DEFAULT_CENTER = { lat: 46.6034, lng: 1.8883 }; // Geographic center of France
const DEFAULT_ZOOM = 5;
const USER_ZOOM = 13;

// Google's own "current location" blue — distinct from the sport-place pins.
const USER_LOCATION_COLOR = "#4285F4";

// Hides Google's default POI icons (gas stations, restaurants, shops, etc.)
// baked into the map tiles — those aren't markers we control, they're part
// of the base map style, so this is the only way to turn them off.
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

type CourtMapProps = {
  userPosition?: { lat: number; lng: number } | null;
  activeSport?: SportSlug | null;
};

export function CourtMap({ userPosition, activeSport }: CourtMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { resolvedTheme } = useTheme();
  const [refreshToken, setRefreshToken] = useState(0);
  const [showSearchArea, setShowSearchArea] = useState(false);

  const activeSportDefinition = activeSport ? getSportBySlug(activeSport) : undefined;
  // No sport filter selected — show every sport's locations at once.
  // Memoized so this stays referentially stable across renders (getSportBySlug
  // returns the same object from SPORTS each time) — otherwise a fresh array
  // literal here would make SportMarkersLayer's search effect refire constantly.
  const sportsToShow = useMemo(
    () => (activeSportDefinition ? [activeSportDefinition] : SPORTS),
    [activeSportDefinition],
  );

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
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
        colorScheme={resolvedTheme === "dark" ? "DARK" : "LIGHT"}
        styles={MAP_STYLES}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        disableDefaultUI
        onDragend={() => setShowSearchArea(true)}
      >
        {userPosition && (
          <>
            {/* Soft halo behind the dot — the classic "current location" look. */}
            <Marker
              position={userPosition}
              clickable={false}
              zIndex={1}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: USER_LOCATION_COLOR,
                fillOpacity: 0.18,
                strokeWeight: 0,
              }}
            />
            <Marker
              position={userPosition}
              title="Your location"
              zIndex={2}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: USER_LOCATION_COLOR,
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          </>
        )}

        <SportMarkersLayer sports={sportsToShow} refreshToken={refreshToken} />

        {showSearchArea && (
          <button
            type="button"
            onClick={() => {
              setRefreshToken((token) => token + 1);
              setShowSearchArea(false);
            }}
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow dark:bg-zinc-900 dark:text-zinc-50"
          >
            Search this area
          </button>
        )}
      </Map>
    </APIProvider>
  );
}
