import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { keyframes } from "@mui/system";
import Link from "next/link";

// Define animation for the trending places
const slideIn = keyframes`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

interface Place {
  place_id: string;
  name: string;
  rating: number;
  photos?: Array<{
    photo_reference: string;
  }>;
}

const TrendingPlaces: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingPlaces = async () => {
      try {
        setLoading(true);
        // Fetch popular restaurants in Santo Domingo
        const response = await fetch(
          "/api/places/search?query=restaurantes populares&location=Santo Domingo&type=restaurant"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trending places");
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          // Take the top 3 places
          setPlaces(data.results.slice(0, 3));
        } else {
          setPlaces([]);
        }
      } catch (err) {
        console.error("Error fetching trending places:", err);
        setError("Could not load trending places");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPlaces();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="body2" color="white" sx={{ fontWeight: 500 }}>
          Trending:
        </Typography>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={120}
            height={28}
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
          />
        ))}
      </Box>
    );
  }

  if (error || places.length === 0) {
    return null; // Don't show anything if there's an error or no places
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 2, overflow: "hidden" }}
    >
      <Typography
        variant="body2"
        color="white"
        sx={{ fontWeight: 500, whiteSpace: "nowrap" }}
      >
        Trending:
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflow: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {places.map((place, index) => (
          <Tooltip key={place.place_id} title={`Rating: ${place.rating}/5`}>
            <Chip
              component={Link}
              href={`/place/${place.place_id}`}
              avatar={
                <Avatar
                  alt={place.name}
                  src={
                    place.photos && place.photos.length > 0
                      ? `/api/places/photo?photoReference=${place.photos[0].photo_reference}&maxWidth=100&cache=true`
                      : ""
                  }
                >
                  <RestaurantIcon fontSize="small" />
                </Avatar>
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      maxWidth: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {place.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <StarIcon sx={{ fontSize: "12px", color: "#FFD700" }} />
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                      {place.rating}
                    </Typography>
                  </Box>
                </Box>
              }
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.25)",
                },
                animation: `${slideIn} 0.5s ease-out ${index * 0.2}s both`,
                textDecoration: "none",
                maxWidth: "180px",
                height: "32px",
              }}
              clickable
            />
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default TrendingPlaces;
