"use client";

import { useMemo, useState } from "react";
import { Marker } from "@vis.gl/react-google-maps";
import { SPORTS, getSportBySlug, type SportSlug } from "shared";
import { Map } from "@/components/Map";
import { SportMarkersLayer } from "@/components/SportMarkersLayer";

const DEFAULT_CENTER = { lat: 45.5019, lng: -73.5674 };
const DEFAULT_ZOOM = 11;
const USER_ZOOM = 13;

const USER_LOCATION_COLOR = "#4285F4";

type CourtMapProps = {
  userPosition?: { lat: number; lng: number } | null;
  activeSport?: SportSlug | null;
};

export function CourtMap({ userPosition, activeSport }: CourtMapProps) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [showSearchArea, setShowSearchArea] = useState(false);

  const activeSportDefinition = activeSport ? getSportBySlug(activeSport) : undefined;
  const sportsToShow = useMemo(
    () => (activeSportDefinition ? [activeSportDefinition] : SPORTS),
    [activeSportDefinition],
  );

  return (
    <Map
      key={userPosition ? `${userPosition.lat}-${userPosition.lng}` : "default"}
      defaultCenter={userPosition ?? DEFAULT_CENTER}
      defaultZoom={userPosition ? USER_ZOOM : DEFAULT_ZOOM}
      onDragend={() => setShowSearchArea(true)}
    >
      {userPosition && (
        <>
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
  );
}
