import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input") || "";
  const location = searchParams.get("location") || "Santo Domingo";
  const types = searchParams.get("types") || "establishment";

  const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!PLACES_API_KEY) {
    console.error("Google Places API key is missing");
    return NextResponse.json(
      { error: "Google Places API key is missing" },
      { status: 500 }
    );
  }

  if (!input) {
    return NextResponse.json({ predictions: [] });
  }

  try {
    // Convert location to coordinates if it's a string
    let locationParam = "";
    if (typeof location === "string" && !location.includes(",")) {
      // Use a default coordinate for Santo Domingo if geocoding fails
      if (location.toLowerCase().includes("santo domingo")) {
        locationParam = "18.4861,-69.9312";
      } else if (location.toLowerCase().includes("santiago")) {
        locationParam = "19.4517,-70.6970";
      } else if (location.toLowerCase().includes("punta cana")) {
        locationParam = "18.5601,-68.3725";
      } else if (location.toLowerCase().includes("puerto plata")) {
        locationParam = "19.7934,-70.6884";
      } else if (location.toLowerCase().includes("la romana")) {
        locationParam = "18.4273,-68.9728";
      } else {
        // Default to Santo Domingo
        locationParam = "18.4861,-69.9312";
      }
    }

    // Build the API URL for Places Autocomplete
    let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${PLACES_API_KEY}`;

    // Add location bias for Dominican Republic
    apiUrl += `&location=${locationParam}&radius=50000`;

    // Add types parameter
    apiUrl += `&types=${encodeURIComponent(types)}`;

    // Restrict to Dominican Republic
    apiUrl += `&components=country:do`;

    console.log(
      "Calling Google Places Autocomplete API:",
      apiUrl.replace(PLACES_API_KEY, "API_KEY_HIDDEN")
    );

    // Make the API request to Google Places Autocomplete
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error(
        `Failed to fetch autocomplete suggestions from Google API: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Google Places Autocomplete API response status:", data.status);

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places Autocomplete API error:", data);
      return NextResponse.json(
        {
          error: `Google Places Autocomplete API error: ${data.status}`,
          status: data.status,
        },
        { status: 500 }
      );
    }

    // Format the response to include only necessary data
    const suggestions = data.predictions.map((prediction: any) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      main_text:
        prediction.structured_formatting?.main_text || prediction.description,
      secondary_text: prediction.structured_formatting?.secondary_text || "",
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch autocomplete suggestions", status: "ERROR" },
      { status: 500 }
    );
  }
}
