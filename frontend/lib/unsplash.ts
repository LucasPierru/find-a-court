import { SPORTS, type SportSlug } from "shared";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const SPORT_QUERIES: Record<SportSlug, string> = {
  tennis: "tennis court",
  padel: "padel court",
  football: "football pitch",
  basketball: "basketball court",
  volleyball: "beach volleyball",
  badminton: "badminton court",
  "table-tennis": "table tennis",
  squash: "squash court",
};

function fallbackUrl(sportId: string): string {
  return `https://picsum.photos/seed/${sportId}/400/200`;
}

interface UnsplashSearchResponse {
  results?: Array<{ urls?: { regular?: string } }>;
}

async function fetchSportPhotoUrl(sportId: SportSlug): Promise<string> {
  if (!UNSPLASH_ACCESS_KEY) {
    return fallbackUrl(sportId);
  }

  try {
    const query = encodeURIComponent(SPORT_QUERIES[sportId]);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        next: { revalidate: 60 * 60 * 24 },
      },
    );

    if (!response.ok) {
      return fallbackUrl(sportId);
    }

    const data = (await response.json()) as UnsplashSearchResponse;
    return data.results?.[0]?.urls?.regular ?? fallbackUrl(sportId);
  } catch {
    return fallbackUrl(sportId);
  }
}

export async function getSportPhotoUrls(): Promise<Record<SportSlug, string>> {
  const entries = await Promise.all(
    SPORTS.map(async (sport) => [sport.id, await fetchSportPhotoUrl(sport.id)] as const),
  );
  return Object.fromEntries(entries) as Record<SportSlug, string>;
}
