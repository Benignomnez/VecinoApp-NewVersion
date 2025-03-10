import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "Santo Domingo";
  const type = searchParams.get("type") || "";

  const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!PLACES_API_KEY) {
    console.error("Google Places API key is missing");
    return NextResponse.json(
      { error: "Google Places API key is missing" },
      { status: 500 }
    );
  }

  try {
    // Convert location to coordinates if it's a string
    let locationParam = location;
    if (typeof location === "string" && !location.includes(",")) {
      // Use a default coordinate for Santo Domingo if geocoding fails
      if (location.toLowerCase().includes("santo domingo")) {
        locationParam = "18.4861,-69.9312";
      } else if (location.toLowerCase().includes("santiago")) {
        locationParam = "19.4517,-70.6970";
      } else if (location.toLowerCase().includes("punta cana")) {
        locationParam = "18.5601,-68.3725";
      } else {
        // Default to Santo Domingo
        locationParam = "18.4861,-69.9312";
      }
    }

    // Determine which API to use based on the query
    let apiUrl;

    if (query) {
      // Use Text Search API when we have a specific query
      apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query + " in " + location
      )}&key=${PLACES_API_KEY}`;

      // Add type if specified
      if (type) {
        apiUrl += `&type=${encodeURIComponent(type)}`;
      }
    } else {
      // Use Nearby Search API when searching by location or type only
      const [lat, lng] = locationParam.split(",");
      apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50000&key=${PLACES_API_KEY}`;

      // Add type if specified
      if (type) {
        apiUrl += `&type=${encodeURIComponent(type)}`;
      } else {
        // Default to restaurants if no type specified
        apiUrl += "&type=restaurant";
      }
    }

    console.log(
      "Calling Google Places API:",
      apiUrl.replace(PLACES_API_KEY, "API_KEY_HIDDEN")
    );

    // Make the API request to Google Places
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error(
        `Failed to fetch places from Google API: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Google Places API response status:", data.status);

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data);
      return NextResponse.json(
        {
          error: `Google Places API error: ${data.status}`,
          status: data.status,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching places:", error);
    return NextResponse.json(
      { error: "Failed to search places", status: "ERROR" },
      { status: 500 }
    );
  }
}
