"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import { CourtMap } from "@/components/CourtMap";

function Spinner() {
  return (
    <div
      className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300"
      role="status"
      aria-label="Loading"
    />
  );
}

export function FindCourtView() {
  const geolocation = useGeolocation();
  const isLoading = geolocation.status === "loading";
  const canRetry =
    geolocation.status === "denied" || geolocation.status === "error";

  return (
    <div className="flex w-full max-w-3xl flex-1 flex-col gap-4 py-16 px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Find a Court
        </h1>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isLoading && (
              <>
                <Spinner />
                Locating you…
              </>
            )}
            {geolocation.status === "success" &&
              `You're at ${geolocation.position.lat.toFixed(4)}, ${geolocation.position.lng.toFixed(4)}`}
            {geolocation.status === "denied" &&
              "Location access is blocked. Enable it in your browser settings, then try again."}
            {geolocation.status === "unsupported" &&
              "Geolocation isn't supported by this browser."}
            {geolocation.status === "error" && geolocation.message}
          </div>

          {canRetry && (
            <button
              type="button"
              onClick={geolocation.requestLocation}
              className="font-medium text-black underline underline-offset-2 dark:text-zinc-50"
            >
              Try again
            </button>
          )}
        </div>
      </div>

      <div className="relative h-[500px] w-full overflow-hidden rounded-lg">
        <CourtMap
          userPosition={
            geolocation.status === "success" ? geolocation.position : null
          }
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-zinc-700 shadow dark:bg-zinc-900 dark:text-zinc-300">
              <Spinner />
              Locating you…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
