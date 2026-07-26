"use client";

import { useCallback, useEffect, useState } from "react";

export type GeolocationState =
  | { status: "loading" }
  | { status: "success"; position: { lat: number; lng: number } }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "error"; message: string };

function isGeolocationSupported() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: "loading" });

  const fetchPosition = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        setState(
          error.code === error.PERMISSION_DENIED
            ? { status: "denied" }
            : { status: "error", message: error.message }
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  const requestLocation = useCallback(() => {
    if (!isGeolocationSupported()) {
      setState({ status: "unsupported" });
      return;
    }
    setState({ status: "loading" });
    fetchPosition();
  }, [fetchPosition]);

  useEffect(() => {
    if (!isGeolocationSupported()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "unsupported" });
      return;
    }

    fetchPosition();

    if (!("permissions" in navigator)) return;

    let permissionStatus: PermissionStatus | undefined;
    let cancelled = false;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        permissionStatus = result;
        permissionStatus.onchange = () => {
          if (permissionStatus?.state === "granted") fetchPosition();
          if (permissionStatus?.state === "denied") setState({ status: "denied" });
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, [fetchPosition]);

  return { ...state, requestLocation };
}
