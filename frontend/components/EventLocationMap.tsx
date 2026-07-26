"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Navigation } from "lucide-react";
import { Map } from "@/components/Map";

type EventLocationMapProps = {
  lat: number;
  lng: number;
  name: string;
};

export function EventLocationMap({ lat, lng, name }: EventLocationMapProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <Map defaultCenter={{ lat, lng }} defaultZoom={15} zoomControl>
      <AdvancedMarker position={{ lat, lng }} title={name} />

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-black shadow hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
      >
        <Navigation className="h-4 w-4" />
        Get directions
      </a>
    </Map>
  );
}
