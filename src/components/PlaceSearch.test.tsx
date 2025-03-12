import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import PlaceSearch from "./PlaceSearch";
import * as placesApi from "../api/places";

// Mock the searchPlaces function
jest.mock("../api/places", () => ({
  ...jest.requireActual("../api/places"),
  searchPlaces: jest.fn(),
}));

describe("PlaceSearch Component", () => {
  const mockOnSearchResults = jest.fn();
  const mockPlaces = [
    {
      id: "place123",
      name: "Test Restaurant",
      address: "Calle Principal 123, Santo Domingo",
      rating: 4.5,
      photos: [{ photoReference: "photo123" }],
    },
    {
      id: "place456",
      name: "Another Restaurant",
      address: "Avenida Central 456, Santo Domingo",
      rating: 4.0,
      photos: [{ photoReference: "photo456" }],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the searchPlaces to return mock places
    (placesApi.searchPlaces as jest.Mock).mockResolvedValue(mockPlaces);
  });

  test("renders search form correctly", () => {
    render(<PlaceSearch onSearchResults={mockOnSearchResults} />);

    // Check if the form elements are rendered
    expect(screen.getByTestId("place-search-form")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/what are you looking for/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();

    // Check if the default location is set
    const locationInput = screen.getByLabelText(
      /location/i
    ) as HTMLInputElement;
    expect(locationInput.value).toBe("Santo Domingo, Dominican Republic");
  });

  test("handles search submission correctly", async () => {
    render(<PlaceSearch onSearchResults={mockOnSearchResults} />);

    // Fill in the search form
    const queryInput = screen.getByLabelText(/what are you looking for/i);
    fireEvent.change(queryInput, { target: { value: "restaurant" } });

    // Submit the form
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Check if the searchPlaces function was called with the correct parameters
    await waitFor(() => {
      expect(placesApi.searchPlaces).toHaveBeenCalledWith(
        "restaurant",
        "Santo Domingo, Dominican Republic"
      );
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockPlaces);
    });
  });

  test("validates empty search query", async () => {
    render(<PlaceSearch onSearchResults={mockOnSearchResults} />);

    // Submit the form without filling in the search query
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Check if the validation error is displayed
    expect(screen.getByText("Please enter a search term")).toBeInTheDocument();

    // Check that the API was not called
    expect(placesApi.searchPlaces).not.toHaveBeenCalled();
    expect(mockOnSearchResults).not.toHaveBeenCalled();
  });

  test("handles search location change", async () => {
    render(<PlaceSearch onSearchResults={mockOnSearchResults} />);

    // Fill in the search form with a custom location
    const queryInput = screen.getByLabelText(/what are you looking for/i);
    fireEvent.change(queryInput, { target: { value: "hotel" } });

    const locationInput = screen.getByLabelText(/location/i);
    fireEvent.change(locationInput, {
      target: { value: "Punta Cana, Dominican Republic" },
    });

    // Submit the form
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Check if the searchPlaces function was called with the updated location
    await waitFor(() => {
      expect(placesApi.searchPlaces).toHaveBeenCalledWith(
        "hotel",
        "Punta Cana, Dominican Republic"
      );
    });
  });

  test("handles API error correctly", async () => {
    // Mock the searchPlaces to throw an error
    (placesApi.searchPlaces as jest.Mock).mockRejectedValue(
      new Error("API error")
    );

    // Spy on console.error to prevent it from cluttering the test output
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<PlaceSearch onSearchResults={mockOnSearchResults} />);

    // Fill in the search form
    const queryInput = screen.getByLabelText(/what are you looking for/i);
    fireEvent.change(queryInput, { target: { value: "restaurant" } });

    // Submit the form
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Check if the error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to search places/i)).toBeInTheDocument();
      expect(mockOnSearchResults).not.toHaveBeenCalled();
    });

    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  test("shows loading state during search", async () => {
    // Create a promise that we can resolve manually to control the timing
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    // Mock the searchPlaces to return our controlled promise
    (placesApi.searchPlaces as jest.Mock).mockImplementation(() => promise);

    render(<PlaceSearch onSearchResults={mockOnSearchResults} />);

    // Fill in the search form
    const queryInput = screen.getByLabelText(/what are you looking for/i);
    fireEvent.change(queryInput, { target: { value: "restaurant" } });

    // Submit the form
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Check if the loading indicator is displayed
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(searchButton).toBeDisabled();

    // Resolve the promise to complete the search
    act(() => {
      resolvePromise(mockPlaces);
    });

    // Check if the loading state is cleared
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /search/i })
      ).not.toBeDisabled();
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockPlaces);
    });
  });
});
