import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for photo URLs
// In a production app, you would use a more robust caching solution
const photoCache: Record<string, { url: string; timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const photoReference = searchParams.get("photoReference");
  const maxWidth = searchParams.get("maxWidth") || "400";
  const useCache = searchParams.get("cache") === "true";

  const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!photoReference) {
    console.error("Photo reference is required");
    return NextResponse.json(
      { error: "Photo reference is required" },
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

  // Create a cache key based on the photo reference and max width
  const cacheKey = `${photoReference}_${maxWidth}`;

  // Check if we have a cached URL and it's not expired
  if (
    useCache &&
    photoCache[cacheKey] &&
    Date.now() - photoCache[cacheKey].timestamp < CACHE_EXPIRY
  ) {
    console.log("Using cached photo URL for:", cacheKey);
    return NextResponse.redirect(photoCache[cacheKey].url);
  }

  try {
    // Build the API URL
    const apiUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${PLACES_API_KEY}`;

    console.log(
      "Calling Google Places Photo API:",
      apiUrl.replace(PLACES_API_KEY, "API_KEY_HIDDEN")
    );

    // Make the API request to Google Places Photos
    const response = await fetch(apiUrl, { redirect: "manual" });

    console.log("Google Places Photo API response status:", response.status);

    // Google Places Photo API returns a 302 redirect to the actual image
    if (response.status === 302) {
      const redirectUrl = response.headers.get("Location");
      if (redirectUrl) {
        console.log("Redirecting to photo URL:", redirectUrl);

        // Cache the redirect URL
        if (useCache) {
          photoCache[cacheKey] = {
            url: redirectUrl,
            timestamp: Date.now(),
          };
        }

        // Redirect to the actual image URL
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error(
        `Failed to fetch photo from Google API: ${response.status}`
      );
    }

    // If we get here, we have the actual image data
    const imageData = await response.arrayBuffer();
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error getting photo:", error);
    // Return a placeholder image
    return NextResponse.redirect(new URL("/place2.jpg", request.url));
  }
}
