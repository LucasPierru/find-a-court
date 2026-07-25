// Thin client for the Places API (New) REST endpoints, called directly with
// fetch (no @vis.gl/react-google-maps widget involved) so the UI around it
// can be fully custom.

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places";

export type PlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  placeId: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
};

export type PlaceResult = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type LocationBias = {
  lat: number;
  lng: number;
  radiusMeters?: number;
};

const DEFAULT_BIAS_RADIUS_METERS = 20_000;

type AutocompleteApiResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
};

type PlaceDetailsApiResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
};

type SearchTextApiResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  }>;
};

export async function autocompletePlaces(
  input: string,
  apiKey: string,
  signal?: AbortSignal,
  locationBias?: LocationBias,
): Promise<PlaceSuggestion[]> {
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      input,
      // Biases (doesn't restrict) results toward the user's location, so
      // nearby courts/pitches rank above unrelated results with the same name.
      ...(locationBias
        ? {
            locationBias: {
              circle: {
                center: { latitude: locationBias.lat, longitude: locationBias.lng },
                radius: locationBias.radiusMeters ?? DEFAULT_BIAS_RADIUS_METERS,
              },
            },
          }
        : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Autocomplete request failed: ${response.status}`);
  }
  const data = (await response.json()) as AutocompleteApiResponse;

  return (data.suggestions ?? []).flatMap((suggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return [];
    return [
      {
        placeId: prediction.placeId,
        primaryText:
          prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? "",
        secondaryText: prediction.structuredFormat?.secondaryText?.text ?? "",
      },
    ];
  });
}

export async function getPlaceDetails(
  placeId: string,
  apiKey: string,
): Promise<PlaceDetails> {
  const response = await fetch(`${PLACE_DETAILS_URL}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location",
    },
  });
  if (!response.ok) {
    throw new Error(`Place details request failed: ${response.status}`);
  }
  const place = (await response.json()) as PlaceDetailsApiResponse;

  return {
    placeId: place.id ?? placeId,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
    lat: place.location?.latitude,
    lng: place.location?.longitude,
  };
}

// Text Search — used for "find courts/pitches for a sport near here" on the
// map. Same REST-endpoint approach as autocomplete/details above, so the map
// discovery layer doesn't depend on @vis.gl/react-google-maps's Places
// library wrapper (only the Maps JS API itself, for rendering the map).
export async function searchPlacesByText(
  textQuery: string,
  apiKey: string,
  locationBias: LocationBias,
  maxResultCount = 20,
): Promise<PlaceResult[]> {
  const response = await fetch(SEARCH_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({
      textQuery,
      locationBias: {
        circle: {
          center: { latitude: locationBias.lat, longitude: locationBias.lng },
          radius: locationBias.radiusMeters ?? DEFAULT_BIAS_RADIUS_METERS,
        },
      },
      maxResultCount,
    }),
  });
  if (!response.ok) {
    throw new Error(`Text search request failed: ${response.status}`);
  }
  const data = (await response.json()) as SearchTextApiResponse;

  return (data.places ?? []).flatMap((place) => {
    if (
      !place.id ||
      place.location?.latitude === undefined ||
      place.location?.longitude === undefined
    ) {
      return [];
    }
    return [
      {
        placeId: place.id,
        name: place.displayName?.text ?? "",
        address: place.formattedAddress ?? "",
        lat: place.location.latitude,
        lng: place.location.longitude,
      },
    ];
  });
}
