import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mock the fetch function
global.fetch = jest.fn();

// Import the API functions (assuming they exist in this location)
import { fetchPlaceDetails, fetchPlacePhotos, searchPlaces } from "./places";

describe("Places API", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("fetchPlaceDetails returns place data correctly", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        result: {
          place_id: "place123",
          name: "Test Restaurant",
          formatted_address: "Calle Principal 123, Santo Domingo",
          rating: 4.5,
          photos: [{ photo_reference: "photo123" }],
          types: ["restaurant", "food"],
          opening_hours: {
            weekday_text: ["Monday: 9:00 AM – 10:00 PM"],
          },
        },
      }),
      ok: true,
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await fetchPlaceDetails("place123");

    expect(result).toEqual({
      id: "place123",
      name: "Test Restaurant",
      address: "Calle Principal 123, Santo Domingo",
      rating: 4.5,
      photos: [{ photoReference: "photo123" }],
      types: ["restaurant", "food"],
      openingHours: {
        weekdayText: ["Monday: 9:00 AM – 10:00 PM"],
      },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/places/details"),
      expect.any(Object)
    );
  });

  test("fetchPlacePhotos returns photo URLs correctly", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        photoUrl: "https://lh3.googleusercontent.com/places/photo123",
      }),
      ok: true,
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await fetchPlacePhotos("photo123", 400);

    expect(result).toBe("https://lh3.googleusercontent.com/places/photo123");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/places/photo"),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("photoReference=photo123"),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("maxWidth=400"),
      expect.any(Object)
    );
  });

  test("searchPlaces returns search results correctly", async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        results: [
          {
            place_id: "place123",
            name: "Test Restaurant",
            formatted_address: "Calle Principal 123, Santo Domingo",
            rating: 4.5,
            photos: [{ photo_reference: "photo123" }],
          },
          {
            place_id: "place456",
            name: "Another Restaurant",
            formatted_address: "Avenida Central 456, Santo Domingo",
            rating: 4.0,
            photos: [{ photo_reference: "photo456" }],
          },
        ],
      }),
      ok: true,
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await searchPlaces("restaurant", "Santo Domingo");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Test Restaurant");
    expect(result[1].name).toBe("Another Restaurant");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/places/search"),
      expect.any(Object)
    );
  });

  test("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: jest.fn().mockResolvedValue({ error: "Server error" }),
    });

    await expect(fetchPlaceDetails("place123")).rejects.toThrow(
      "Failed to fetch place details"
    );
  });
});
