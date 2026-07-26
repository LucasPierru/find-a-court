"use client";

import { APIProvider, Map as GoogleMap, type MapProps } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { cn } from "@/components/ui";

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

type MapProperties = Omit<MapProps, "colorScheme" | "styles" | "mapId">;

export function Map({ className, children, ...mapProps }: MapProperties) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { resolvedTheme } = useTheme();

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
      <GoogleMap
        className={cn("relative h-full w-full rounded-lg", className)}
        colorScheme={resolvedTheme === "dark" ? "DARK" : "LIGHT"}
        styles={MAP_STYLES}
        mapId="DEMO_MAP_ID"
        disableDefaultUI
        gestureHandling="greedy"
        {...mapProps}
      >
        {children}
      </GoogleMap>
    </APIProvider>
  );
}
