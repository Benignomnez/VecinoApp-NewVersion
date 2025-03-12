import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlaceDetails from "./PlaceDetails";
import { Place } from "../api/places";
import * as placesApi from "../api/places";

// Mock the fetchPlacePhotos function
jest.mock("../api/places", () => ({
  ...jest.requireActual("../api/places"),
  fetchPlacePhotos: jest.fn(),
}));

describe("PlaceDetails Component", () => {
  const mockPlace: Place = {
    id: "place123",
    name: "Test Restaurant",
    address: "Calle Principal 123, Santo Domingo",
    rating: 4.5,
    photos: [{ photoReference: "photo123" }],
    types: ["restaurant", "food", "point_of_interest"],
    openingHours: {
      weekdayText: [
        "Monday: 9:00 AM – 10:00 PM",
        "Tuesday: 9:00 AM – 10:00 PM",
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the fetchPlacePhotos to return a URL
    (placesApi.fetchPlacePhotos as jest.Mock).mockResolvedValue(
      "https://example.com/photo.jpg"
    );
  });

  test("renders place details correctly", async () => {
    await act(async () => {
      render(<PlaceDetails place={mockPlace} />);
    });

    // Check if the name is rendered
    expect(screen.getByTestId("place-name")).toHaveTextContent(
      "Test Restaurant"
    );

    // Check if the address is rendered
    expect(screen.getByTestId("place-address")).toHaveTextContent(
      "Calle Principal 123, Santo Domingo"
    );

    // Check if the rating is rendered
    expect(screen.getByTestId("place-rating")).toBeInTheDocument();

    // Check if the types are rendered
    expect(screen.getByTestId("place-type-restaurant")).toHaveTextContent(
      "restaurant"
    );
    expect(screen.getByTestId("place-type-food")).toHaveTextContent("food");

    // Check if the opening hours are rendered
    expect(screen.getByTestId("opening-hours-0")).toHaveTextContent(
      "Monday: 9:00 AM – 10:00 PM"
    );
    expect(screen.getByTestId("opening-hours-1")).toHaveTextContent(
      "Tuesday: 9:00 AM – 10:00 PM"
    );

    // Check if the photo is loaded
    await waitFor(() => {
      expect(placesApi.fetchPlacePhotos).toHaveBeenCalledWith("photo123");
      expect(screen.getByTestId("place-photo")).toHaveAttribute(
        "src",
        "https://example.com/photo.jpg"
      );
    });
  });

  test("handles place without photos", async () => {
    const placeWithoutPhotos: Place = {
      ...mockPlace,
      photos: undefined,
    };

    await act(async () => {
      render(<PlaceDetails place={placeWithoutPhotos} />);
    });

    // Check that the photo fetch was not called
    await waitFor(() => {
      expect(placesApi.fetchPlacePhotos).not.toHaveBeenCalled();
      expect(screen.queryByTestId("place-photo")).not.toBeInTheDocument();
      expect(screen.getByText("No photo available")).toBeInTheDocument();
    });
  });

  test("handles place without types", async () => {
    const placeWithoutTypes: Place = {
      ...mockPlace,
      types: undefined,
    };

    await act(async () => {
      render(<PlaceDetails place={placeWithoutTypes} />);
    });

    // Check that no type chips are rendered
    expect(
      screen.queryByTestId("place-type-restaurant")
    ).not.toBeInTheDocument();
  });

  test("handles place without opening hours", async () => {
    const placeWithoutHours: Place = {
      ...mockPlace,
      openingHours: undefined,
    };

    await act(async () => {
      render(<PlaceDetails place={placeWithoutHours} />);
    });

    // Check that no opening hours are rendered
    expect(screen.queryByText("Opening Hours")).not.toBeInTheDocument();
    expect(screen.queryByTestId("opening-hours-0")).not.toBeInTheDocument();
  });

  test("handles photo loading error", async () => {
    // Mock the fetchPlacePhotos to throw an error
    (placesApi.fetchPlacePhotos as jest.Mock).mockRejectedValue(
      new Error("Failed to load photo")
    );

    // Spy on console.error to prevent it from cluttering the test output
    jest.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      render(<PlaceDetails place={mockPlace} />);
    });

    // Check that the error is handled gracefully
    await waitFor(() => {
      expect(placesApi.fetchPlacePhotos).toHaveBeenCalledWith("photo123");
      expect(screen.queryByTestId("place-photo")).not.toBeInTheDocument();
      expect(screen.getByText("No photo available")).toBeInTheDocument();
    });

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
});
