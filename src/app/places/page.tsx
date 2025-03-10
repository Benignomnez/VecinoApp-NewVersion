"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Chip from "@mui/material/Chip";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import {
  searchPlaces,
  PlaceResult,
  getPlacePhotoUrl,
} from "@/lib/googlePlaces";

export default function PlacesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "Santo Domingo";
  const type = searchParams.get("type") || "";

  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        // If we're searching by type only (category), use that as the query
        const searchQuery = query || type;

        if (!searchQuery) {
          setError("Por favor ingrese un término de búsqueda");
          setLoading(false);
          return;
        }

        console.log("Fetching places with:", { searchQuery, location, type });
        const response = await searchPlaces(searchQuery, location, type);
        console.log("Search response:", response);

        if (
          response.status === "OK" &&
          response.results &&
          response.results.length > 0
        ) {
          console.log(`Found ${response.results.length} places`);
          setPlaces(response.results);
        } else if (
          response.status === "ZERO_RESULTS" ||
          (response.results && response.results.length === 0)
        ) {
          console.log("No results found");
          setError("No se encontraron resultados para su búsqueda");
        } else if (response.status === "ERROR") {
          console.error("API returned ERROR status");
          setError(
            "Error al buscar lugares. Por favor intente de nuevo más tarde."
          );
        } else {
          console.error("Unknown API response:", response);
          setError(
            "Error al buscar lugares. Por favor intente de nuevo más tarde."
          );
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError(
          "Error al buscar lugares. Por favor intente de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [query, location, type]);

  const getPlaceImage = (place: PlaceResult) => {
    // Check if the place has photos from the API
    if (place.photos && place.photos.length > 0) {
      // Sort photos by reference to ensure consistency with detail page
      const sortedPhotos = [...place.photos].sort((a, b) =>
        a.photo_reference.localeCompare(b.photo_reference)
      );
      return getPlacePhotoUrl(sortedPhotos[0].photo_reference);
    }

    // Fallback to placeholder images based on type
    const placeType = place.types?.[0] || "restaurant";

    if (placeType.includes("restaurant") || placeType.includes("food")) {
      return "/restaurant1.jpg";
    } else if (placeType.includes("hotel") || placeType.includes("lodging")) {
      return "/hotel1.jpg";
    } else if (placeType.includes("beach")) {
      return "/place3.jpg";
    } else if (placeType.includes("cafe")) {
      return "/restaurant4.jpg";
    } else if (placeType.includes("bar")) {
      return "/restaurant2.jpg";
    } else if (placeType.includes("service")) {
      return "/restaurant3.jpg";
    } else {
      return "/place2.jpg";
    }
  };

  const getPlaceType = (place: PlaceResult) => {
    const type = place.types?.[0] || "";

    if (type.includes("restaurant") || type.includes("food")) {
      return "Restaurante";
    } else if (type.includes("lodging") || type.includes("hotel")) {
      return "Hotel";
    } else if (type.includes("beach")) {
      return "Playa";
    } else if (type.includes("cafe")) {
      return "Cafetería";
    } else if (type.includes("bar")) {
      return "Bar";
    } else {
      return "Lugar";
    }
  };

  return (
    <MainLayout>
      <Container sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {type
            ? `Lugares en la categoría: ${type}`
            : `Resultados para "${query}" en ${location}`}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ my: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {places.map((place) => (
              <Grid item xs={12} sm={6} md={4} key={place.place_id}>
                <Link
                  href={`/place/${place.place_id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={getPlaceImage(place)}
                      alt={place.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        noWrap
                        sx={{ mb: 1 }}
                      >
                        {place.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Rating
                          value={place.rating || 0}
                          precision={0.1}
                          readOnly
                          size="small"
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          ({place.user_ratings_total || 0})
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <LocationOnIcon
                            color="action"
                            fontSize="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {place.vicinity || place.formatted_address}
                          </Typography>
                        </Box>
                        <Chip
                          label={getPlaceType(place)}
                          size="small"
                          sx={{ alignSelf: "flex-start" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
