"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import type { Sport } from "shared";
import { searchPlacesByText, type PlaceResult } from "@/services/googlePlaces";

type SportPlace = { sport: Sport; place: PlaceResult };

type SportMarkersLayerProps = {
  sports: readonly Sport[];
  refreshToken: number;
};

// Google's Text Search (New) caps a single request at 20 results.
const MAX_RESULTS_PER_SPORT = 20;
// "Overlapping on screen" depends on zoom, not a fixed real-world distance —
// two markers 100m apart can fully overlap when zoomed out, or sit far apart
// once zoomed in. So the cluster radius is computed in *pixels* and converted
// to meters using the zoom level at search time (see metersPerPixel below).
const CLUSTER_DISTANCE_PX = 30;
const FAN_OUT_RADIUS_PX = 26;
const STACK_PEEK_PX = 3;
const CLUSTER_BUTTON_PX = 28;
// Must comfortably cover the full fanned-out extent (radius + button size),
// or the hover-detection box ends before the icons do — the gap between them
// causes mouseleave to fire mid-hover, snapping the icons back together and
// re-triggering mouseenter in a jittery loop.
const HOVER_ZONE_PX = (FAN_OUT_RADIUS_PX + CLUSTER_BUTTON_PX / 2) * 2 + 24;

// Standard Web Mercator meters-per-pixel formula.
function metersPerPixel(lat: number, zoom: number) {
  return (156_543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

// Flat-earth approximation — fine at the small distances used for clustering.
function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((a.lat * Math.PI) / 180);
  const dy = (b.lat - a.lat) * metersPerDegLat;
  const dx = (b.lng - a.lng) * metersPerDegLng;
  return Math.sqrt(dx * dx + dy * dy);
}

function clusterByProximity(items: SportPlace[], thresholdMeters: number): SportPlace[][] {
  const clusters: SportPlace[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    if (assigned.has(i)) continue;
    const cluster = [items[i]];
    assigned.add(i);
    for (let j = i + 1; j < items.length; j++) {
      if (assigned.has(j)) continue;
      if (distanceMeters(items[i].place, items[j].place) < thresholdMeters) {
        cluster.push(items[j]);
        assigned.add(j);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

// Google sometimes returns multiple near-duplicate listings (different place
// IDs) for what's really one physical spot — they land in the same cluster,
// so drop repeats of the same sport within a cluster, keeping the first.
function dedupeClusterBySport(cluster: SportPlace[]): SportPlace[] {
  const seenSportIds = new Set<string>();
  return cluster.filter((item) => {
    if (seenSportIds.has(item.sport.id)) return false;
    seenSportIds.add(item.sport.id);
    return true;
  });
}

function clusterCenter(cluster: SportPlace[]) {
  const lat = cluster.reduce((sum, item) => sum + item.place.lat, 0) / cluster.length;
  const lng = cluster.reduce((sum, item) => sum + item.place.lng, 0) / cluster.length;
  return { lat, lng };
}

export function SportMarkersLayer({ sports, refreshToken }: SportMarkersLayerProps) {
  const map = useMap();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [places, setPlaces] = useState<SportPlace[]>([]);
  const [clusterThresholdMeters, setClusterThresholdMeters] = useState(
    CLUSTER_DISTANCE_PX * metersPerPixel(45, 13),
  );
  const [selected, setSelected] = useState<SportPlace | null>(null);

  const runSearch = useCallback(async () => {
    if (!apiKey || !map) return;
    const center = map.getCenter();
    if (!center) return;
    const zoom = map.getZoom() ?? 13;
    const bias = { lat: center.lat(), lng: center.lng(), radiusMeters: 5000 };

    const resultsBySport = await Promise.all(
      sports.map(async (sport) => {
        try {
          const results = await searchPlacesByText(
            sport.placesQuery,
            apiKey,
            bias,
            MAX_RESULTS_PER_SPORT,
          );
          return results.map((place) => ({ sport, place }));
        } catch {
          return [];
        }
      }),
    );

    setPlaces(resultsBySport.flat());
    // Captured at search time (rather than tracked live) since clusters only
    // need to be recomputed when new data comes in anyway.
    setClusterThresholdMeters(CLUSTER_DISTANCE_PX * metersPerPixel(center.lat(), zoom));
  }, [apiKey, map, sports]);

  // Re-searches on mount, whenever the active sport list changes, and
  // whenever the parent bumps `refreshToken` (the shared "search this area").
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runSearch only sets state after its internal `await`, this is the standard fetch-on-mount effect pattern
    runSearch();
  }, [runSearch, refreshToken]);

  const clusters = useMemo(
    () => clusterByProximity(places, clusterThresholdMeters).map(dedupeClusterBySport),
    [places, clusterThresholdMeters],
  );

  return (
    <>
      {clusters.map((cluster) => (
        <SportMarkerCluster
          key={cluster.map((item) => item.place.placeId).join(",")}
          cluster={cluster}
          center={clusterCenter(cluster)}
          onSelect={setSelected}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.place.lat, lng: selected.place.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="flex flex-col gap-1 text-sm text-black">
            <span className="font-medium">
              {selected.sport.icon} {selected.place.name}
            </span>
            {selected.place.address && (
              <span className="text-zinc-600">{selected.place.address}</span>
            )}
            <Link
              href={{
                pathname: "/events/new",
                query: {
                  locationName: selected.place.name,
                  locationAddress: selected.place.address,
                  lat: selected.place.lat,
                  lng: selected.place.lng,
                  placeId: selected.place.placeId,
                  sport: selected.sport.id,
                },
              }}
              className="mt-1 font-medium text-blue-600 underline underline-offset-2"
            >
              Create event here
            </Link>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

type SportMarkerClusterProps = {
  cluster: SportPlace[];
  center: { lat: number; lng: number };
  onSelect: (item: SportPlace) => void;
};

function SportMarkerCluster({ cluster, center, onSelect }: SportMarkerClusterProps) {
  if (cluster.length === 1) {
    const item = cluster[0];
    return (
      <AdvancedMarker position={center} onClick={() => onSelect(item)}>
        <span
          className="block text-2xl leading-none"
          title={`${item.sport.name}: ${item.place.name}`}
        >
          {item.sport.icon}
        </span>
      </AdvancedMarker>
    );
  }

  return <ExpandableSportMarkerCluster cluster={cluster} center={center} onSelect={onSelect} />;
}

function ExpandableSportMarkerCluster({ cluster, center, onSelect }: SportMarkerClusterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const count = cluster.length;

  return (
    // `clickable` matters here beyond its name — AdvancedMarker only becomes
    // pointer-interactive (hover included) once it's marked clickable;
    // otherwise Google's underlying element sets pointer-events: none on its
    // content and every mouse event on the children below is silently dropped.
    <AdvancedMarker position={center} clickable>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center justify-center"
        style={{ width: HOVER_ZONE_PX, height: HOVER_ZONE_PX }}
      >
        {/* Sized to the collapsed icon itself — the badge and buttons below
            position relative to THIS, not the much bigger hover zone above,
            so they stay anchored to the marker's actual point regardless of
            how big the invisible hover-detection area is. */}
        <div
          className="relative"
          style={{ width: CLUSTER_BUTTON_PX, height: CLUSTER_BUTTON_PX }}
        >
          {cluster.map((item, index) => {
            const angle = (2 * Math.PI * index) / count - Math.PI / 2;
            const [x, y] = isHovered
              ? [Math.cos(angle) * FAN_OUT_RADIUS_PX, Math.sin(angle) * FAN_OUT_RADIUS_PX]
              : [Math.cos(angle) * STACK_PEEK_PX, Math.sin(angle) * STACK_PEEK_PX];

            return (
              <button
                key={`${item.sport.id}-${item.place.placeId}`}
                type="button"
                onClick={() => onSelect(item)}
                title={`${item.sport.name}: ${item.place.name}`}
                className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg shadow transition-transform duration-200 ease-out dark:bg-zinc-900"
                style={{ transform: `translate(${x}px, ${y}px)`, zIndex: count - index }}
              >
                {item.sport.icon}
              </button>
            );
          })}

          {!isHovered && (
            <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white dark:bg-white dark:text-black">
              {count}
            </span>
          )}
        </div>
      </div>
    </AdvancedMarker>
  );
}
