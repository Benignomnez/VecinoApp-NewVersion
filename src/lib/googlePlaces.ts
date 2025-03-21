"use client";

// Types for Google Places API responses
export interface PlaceResult {
  place_id: string;
  id?: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  vicinity?: string;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface PlacesSearchResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
}

export interface PlaceDetailsResponse {
  result: PlaceResult & {
    reviews?: {
      id?: string;
      author_name: string;
      rating: number;
      text: string;
      time: number;
      profile_photo_url?: string;
    }[];
    website?: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    url?: string;
    address_components?: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
  };
  status: string;
}

const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
// Set to false to use real API calls
const USE_MOCK_DATA = false;

if (!PLACES_API_KEY) {
  console.warn("Google Places API key is missing. Using mock data instead.");
}

// Mock data for development
const mockRestaurants: PlaceResult[] = [
  {
    place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    name: "Restaurante El Conuco",
    formatted_address: "Calle Casimiro de Moya 152, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4861,
        lng: -69.9312,
      },
    },
    rating: 4.7,
    user_ratings_total: 128,
    types: ["restaurant", "food"],
    vicinity: "Santo Domingo",
  },
  {
    place_id: "ChIJP3Sa8ziYEmsRUKgyFmh9AQM",
    name: "Adrian Tropical",
    formatted_address: "Av. George Washington, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4655,
        lng: -69.9223,
      },
    },
    rating: 4.5,
    user_ratings_total: 156,
    types: ["restaurant", "food"],
    vicinity: "Santo Domingo",
  },
  {
    place_id: "ChIJrTLr-GyuEmsRBfy61i59si0",
    name: "La Cassina",
    formatted_address: "Calle El Conde, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4722,
        lng: -69.8883,
      },
    },
    rating: 4.3,
    user_ratings_total: 98,
    types: ["restaurant", "food"],
    vicinity: "Santo Domingo",
  },
  {
    place_id: "ChIJlTwoTWyuEmsRMFymbMkVkOE",
    name: "Mesón de Bari",
    formatted_address: "Calle Hostos 302, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4733,
        lng: -69.8875,
      },
    },
    rating: 4.6,
    user_ratings_total: 112,
    types: ["restaurant", "food"],
    vicinity: "Santo Domingo",
  },
];

const mockHotels: PlaceResult[] = [
  {
    place_id: "ChIJpTvG15qsEmsRi0yGhRE5dXQ",
    name: "Hotel Catalonia Santo Domingo",
    formatted_address: "Av. George Washington 500, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4633,
        lng: -69.9167,
      },
    },
    rating: 4.4,
    user_ratings_total: 87,
    types: ["lodging", "hotel"],
    vicinity: "Santo Domingo",
  },
  {
    place_id: "ChIJV2vIE1mvEmsRQBZPlKzh1Bs",
    name: "Renaissance Santo Domingo Jaragua Hotel & Casino",
    formatted_address: "Av. George Washington 367, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4644,
        lng: -69.9189,
      },
    },
    rating: 4.5,
    user_ratings_total: 103,
    types: ["lodging", "hotel"],
    vicinity: "Santo Domingo",
  },
];

const mockBeaches: PlaceResult[] = [
  {
    place_id: "ChIJmysnFpfX5I8RhaGfEwKjAQM",
    name: "Playa Boca Chica",
    formatted_address: "Boca Chica, República Dominicana",
    geometry: {
      location: {
        lat: 18.4561,
        lng: -69.6142,
      },
    },
    rating: 4.2,
    user_ratings_total: 178,
    types: ["natural_feature", "beach"],
    vicinity: "Boca Chica",
  },
  {
    place_id: "ChIJFUBxYhXX5I8RhUGfEwKjAQM",
    name: "Playa Juan Dolio",
    formatted_address: "Juan Dolio, República Dominicana",
    geometry: {
      location: {
        lat: 18.4233,
        lng: -69.4275,
      },
    },
    rating: 4.4,
    user_ratings_total: 145,
    types: ["natural_feature", "beach"],
    vicinity: "Juan Dolio",
  },
];

const mockCafes: PlaceResult[] = [
  {
    place_id: "ChIJNUd9k0qvEmsRUN4hsnTjBAQ",
    name: "Café del Sol",
    formatted_address: "Calle El Conde 53, Santo Domingo",
    geometry: {
      location: {
        lat: 18.4728,
        lng: -69.8881,
      },
    },
    rating: 4.5,
    user_ratings_total: 67,
    types: ["cafe", "food"],
    vicinity: "Santo Domingo",
  },
];

// Search for places
export const searchPlaces = async (
  query: string,
  location: string = "Santo Domingo",
  type: string = ""
): Promise<PlacesSearchResponse> => {
  try {
    // Use mock data for development
    if (USE_MOCK_DATA) {
      console.log("Using mock data for search:", { query, location, type });

      // Filter mock data based on query and type
      let results: PlaceResult[] = [];

      const normalizedQuery = query.toLowerCase();
      const normalizedType = type.toLowerCase();

      if (
        normalizedType.includes("restaurante") ||
        normalizedQuery.includes("restaurante") ||
        normalizedQuery.includes("comida")
      ) {
        results = [...results, ...mockRestaurants];
      }

      if (
        normalizedType.includes("hotel") ||
        normalizedQuery.includes("hotel") ||
        normalizedQuery.includes("alojamiento")
      ) {
        results = [...results, ...mockHotels];
      }

      if (
        normalizedType.includes("playa") ||
        normalizedQuery.includes("playa") ||
        normalizedQuery.includes("beach")
      ) {
        results = [...results, ...mockBeaches];
      }

      if (
        normalizedType.includes("cafe") ||
        normalizedQuery.includes("cafe") ||
        normalizedQuery.includes("cafetería")
      ) {
        results = [...results, ...mockCafes];
      }

      // If no specific type or query match, return all mock data
      if (results.length === 0) {
        results = [
          ...mockRestaurants,
          ...mockHotels,
          ...mockBeaches,
          ...mockCafes,
        ];
      }

      // Further filter by name if there's a specific query
      if (normalizedQuery && !normalizedType) {
        results = results.filter(
          (place) =>
            place.name.toLowerCase().includes(normalizedQuery) ||
            (place.vicinity &&
              place.vicinity.toLowerCase().includes(normalizedQuery))
        );
      }

      return {
        results,
        status: results.length > 0 ? "OK" : "ZERO_RESULTS",
      };
    }

    // For real API calls, we need to use a server-side API route to avoid CORS issues
    console.log("Searching places with:", { query, location, type });
    const response = await fetch(
      `/api/places/search?query=${encodeURIComponent(
        query
      )}&location=${encodeURIComponent(location)}&type=${encodeURIComponent(
        type
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      throw new Error(`Failed to fetch places: ${response.status}`);
    }

    const data = await response.json();
    console.log("Search results:", data);
    return data;
  } catch (error) {
    console.error("Error searching places:", error);
    return { results: [], status: "ERROR" };
  }
};

// Get place details
export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetailsResponse> => {
  try {
    // Use mock data for development
    if (USE_MOCK_DATA) {
      console.log("Using mock data for place details:", placeId);

      // Find the place in our mock data
      const allMockPlaces = [
        ...mockRestaurants,
        ...mockHotels,
        ...mockBeaches,
        ...mockCafes,
      ];
      const place = allMockPlaces.find((p) => p.place_id === placeId);

      if (!place) {
        // Return a default place if not found
        return {
          result: {
            place_id: placeId,
            name: "Restaurante El Conuco",
            formatted_address:
              "Calle Casimiro de Moya 152, Santo Domingo, República Dominicana",
            geometry: {
              location: {
                lat: 18.4861,
                lng: -69.9312,
              },
            },
            rating: 4.7,
            user_ratings_total: 128,
            types: ["restaurant", "food"],
            vicinity: "Santo Domingo",
            formatted_phone_number: "+1 809-686-0129",
            website: "https://elconuco.com.do",
            reviews: [
              {
                author_name: "María Rodríguez",
                rating: 5,
                text: "Excelente comida y servicio. Los tostones son los mejores que he probado en Santo Domingo.",
                time: 1677686400, // March 1, 2023
                profile_photo_url: "/user1.jpg",
              },
              {
                author_name: "Juan Pérez",
                rating: 4,
                text: "Muy buena experiencia. La comida es auténtica dominicana y el ambiente es acogedor.",
                time: 1675267200, // February 1, 2023
                profile_photo_url: "/user2.jpg",
              },
              {
                author_name: "Ana Gómez",
                rating: 5,
                text: "Uno de los mejores restaurantes de comida típica en Santo Domingo. El mofongo es espectacular.",
                time: 1672588800, // January 1, 2023
                profile_photo_url: "/user3.jpg",
              },
            ],
          },
          status: "OK",
        };
      }

      // Add additional details to the found place
      return {
        result: {
          ...place,
          formatted_phone_number: "+1 809-123-4567",
          website: `https://example.com/${place.name
            .toLowerCase()
            .replace(/\s+/g, "-")}`,
          reviews: [
            {
              author_name: "Usuario Satisfecho",
              rating: 5,
              text: `Excelente experiencia en ${place.name}. Definitivamente regresaré.`,
              time: 1677686400, // March 1, 2023
              profile_photo_url: "/user1.jpg",
            },
            {
              author_name: "Cliente Frecuente",
              rating: 4,
              text: `Muy buena atención en ${place.name}. El servicio es de primera.`,
              time: 1675267200, // February 1, 2023
              profile_photo_url: "/user2.jpg",
            },
          ],
        },
        status: "OK",
      };
    }

    // For real API calls, we need to use a server-side API route to avoid CORS issues
    console.log("Getting place details for:", placeId);
    const response = await fetch(
      `/api/places/details?placeId=${encodeURIComponent(placeId)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      throw new Error(`Failed to fetch place details: ${response.status}`);
    }

    const data = await response.json();
    console.log("Place details:", data);
    return data;
  } catch (error) {
    console.error("Error getting place details:", error);
    return { result: {} as any, status: "ERROR" };
  }
};

// Get place photo URL
export const getPlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 400
): string => {
  if (USE_MOCK_DATA) {
    // Return a placeholder image
    return "/images/place-icon.jpg";
  }

  // For real API calls, we need to use a server-side API route to avoid CORS issues
  // Add a cache parameter to ensure consistent image URLs for the same photo reference
  return `/api/places/photo?photoReference=${photoReference}&maxWidth=${maxWidth}&cache=true`;
};
