import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const placeId = searchParams.get("placeId");

  const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!placeId) {
    console.error("Place ID is required");
    return NextResponse.json(
      { error: "Place ID is required" },
      { status: 400 }
    );
  }

  if (!PLACES_API_KEY) {
    console.error("Google Places API key is missing");
    return NextResponse.json(
      { error: "Google Places API key is missing" },
      { status: 500 }
    );
  }

  try {
    // Build the API URL
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photos,rating,reviews,website,formatted_phone_number,international_phone_number,url,address_components,opening_hours,price_level,types&key=${PLACES_API_KEY}`;

    console.log(
      "Calling Google Places Details API:",
      apiUrl.replace(PLACES_API_KEY, "API_KEY_HIDDEN")
    );

    // Make the API request to Google Places
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error(
        `Failed to fetch place details from Google API: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Google Places Details API response status:", data.status);

    if (data.status !== "OK") {
      console.error("Google Places Details API error:", data);
      return NextResponse.json(
        {
          error: `Google Places Details API error: ${data.status}`,
          status: data.status,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting place details:", error);
    return NextResponse.json(
      { error: "Failed to get place details", status: "ERROR" },
      { status: 500 }
    );
  }
}
