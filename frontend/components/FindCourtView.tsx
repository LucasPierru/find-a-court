"use client";

import { useState } from "react";
import type { SportSlug } from "shared";
import { useGeolocation } from "@/hooks/useGeolocation";
import { CourtMap } from "@/components/CourtMap";
import { SportFilterPills } from "@/components/SportFilterPills";

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
  const [activeSport, setActiveSport] = useState<SportSlug | null>(null);

  return (
    <div className="flex w-full flex-1 flex-col gap-4">
      {/* <h1 className="mx-auto w-full max-w-3xl px-6 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Find a Court
      </h1> */}

      <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
        <CourtMap
          userPosition={geolocation.status === "success" ? geolocation.position : null}
          activeSport={activeSport}
        />
        <SportFilterPills active={activeSport} onChange={setActiveSport} />
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
