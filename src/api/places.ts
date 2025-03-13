/**
 * Places API service for interacting with Google Places API
 */

export interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  photos?: { photoReference: string }[];
  types?: string[];
  openingHours?: {
    weekdayText: string[];
  };
}

/**
 * Fetches details for a specific place by ID
 * @param placeId The Google Places ID
 * @returns Place details
 */
export async function fetchPlaceDetails(placeId: string): Promise<Place> {
  const response = await fetch(`/api/places/details?placeId=${placeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch place details");
  }

  const data = await response.json();
  const { result } = data;

  return {
    id: result.place_id,
    name: result.name,
    address: result.formatted_address,
    rating: result.rating,
    photos: result.photos?.map((photo: any) => ({
      photoReference: photo.photo_reference,
    })),
    types: result.types,
    openingHours: result.opening_hours
      ? {
          weekdayText: result.opening_hours.weekday_text,
        }
      : undefined,
  };
}

/**
 * Fetches a photo using its reference ID
 * @param photoReference The Google Places photo reference
 * @param maxWidth The maximum width of the photo
 * @returns URL to the photo
 */
export async function fetchPlacePhotos(
  photoReference: string,
  maxWidth: number = 400
): Promise<string> {
  const response = await fetch(
    `/api/places/photo?photoReference=${photoReference}&maxWidth=${maxWidth}&cache=true`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch place photo");
  }

  const data = await response.json();
  return data.photoUrl;
}

/**
 * Searches for places based on query and location
 * @param query The search query
 * @param location The location to search in
 * @returns List of places matching the search criteria
 */
export async function searchPlaces(
  query: string,
  location: string
): Promise<Place[]> {
  const response = await fetch(
    `/api/places/search?query=${encodeURIComponent(
      query
    )}&location=${encodeURIComponent(location)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search places");
  }

  const data = await response.json();

  return data.results.map((result: any) => ({
    id: result.place_id,
    name: result.name,
    address: result.formatted_address,
    rating: result.rating,
    photos: result.photos?.map((photo: any) => ({
      photoReference: photo.photo_reference,
    })),
  }));
}
