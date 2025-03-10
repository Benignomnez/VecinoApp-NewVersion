"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  searchPlaces,
  PlaceResult,
  getPlacePhotoUrl,
} from "@/lib/googlePlaces";

export default function WriteReviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { authState } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!authState.user && !authState.isLoading) {
    router.push("/auth?mode=login");
    return null;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const response = await searchPlaces(searchQuery, "Santo Domingo");

      if (
        response.status === "OK" &&
        response.results &&
        response.results.length > 0
      ) {
        setSearchResults(response.results);
      } else if (response.status === "ZERO_RESULTS") {
        setError("No se encontraron resultados para su búsqueda");
        setSearchResults([]);
      } else {
        setError(
          "Error al buscar lugares. Por favor intente de nuevo más tarde."
        );
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Error searching places:", err);
      setError(
        "Error al buscar lugares. Por favor intente de nuevo más tarde."
      );
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    setSelectedPlace(null);
    setRating(null);
    setReviewText("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authState.user || !selectedPlace || !rating || !reviewText.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("reviews").insert({
        user_id: authState.user.id,
        place_id: selectedPlace.place_id,
        place_name: selectedPlace.name,
        place_address:
          selectedPlace.formatted_address || selectedPlace.vicinity,
        place_photo: selectedPlace.photos?.[0]?.photo_reference || null,
        rating,
        comment: reviewText.trim(),
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setRating(null);
      setReviewText("");
      setSelectedPlace(null);

      // Redirect to the place page after a short delay
      setTimeout(() => {
        router.push(`/place/${selectedPlace.place_id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(
        err.message ||
          "Error al publicar la reseña. Por favor intente de nuevo más tarde."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getPlaceImage = (place: PlaceResult) => {
    if (place.photos && place.photos.length > 0) {
      return getPlacePhotoUrl(place.photos[0].photo_reference);
    }
    return "/place-placeholder.jpg";
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Escribir una Reseña
          </Typography>

          {success ? (
            <Alert severity="success" sx={{ my: 2 }}>
              ¡Reseña publicada con éxito! Redirigiendo...
            </Alert>
          ) : (
            <>
              {!selectedPlace ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    mb: 4,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Buscar un lugar para reseñar
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Buscar restaurantes, hoteles, servicios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSearch}
                      disabled={searching || !searchQuery.trim()}
                      startIcon={
                        searching ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SearchIcon />
                        )
                      }
                    >
                      {searching ? "Buscando..." : "Buscar"}
                    </Button>
                  </Box>

                  {error && <Alert severity="error">{error}</Alert>}

                  {searchResults.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Resultados de la búsqueda:
                      </Typography>
                      <List>
                        {searchResults.map((place) => (
                          <React.Fragment key={place.place_id}>
                            <ListItem
                              button
                              onClick={() => handleSelectPlace(place)}
                              sx={{
                                borderRadius: 1,
                                "&:hover": {
                                  bgcolor: "action.hover",
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  src={getPlaceImage(place)}
                                  alt={place.name}
                                  variant="rounded"
                                  sx={{ width: 60, height: 60, mr: 1 }}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={place.name}
                                secondary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <LocationOnIcon
                                      fontSize="small"
                                      sx={{ mr: 0.5, color: "text.secondary" }}
                                    />
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {place.formatted_address ||
                                        place.vicinity}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                            <Divider component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    </Box>
                  )}
                </Paper>
              ) : (
                <Box component="form" onSubmit={handleSubmitReview}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      mb: 4,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Avatar
                        src={getPlaceImage(selectedPlace)}
                        alt={selectedPlace.name}
                        variant="rounded"
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {selectedPlace.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LocationOnIcon
                            fontSize="small"
                            sx={{ mr: 0.5, color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {selectedPlace.formatted_address ||
                              selectedPlace.vicinity}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="text"
                        color="primary"
                        onClick={handleClearSelection}
                        sx={{ ml: "auto" }}
                      >
                        Cambiar
                      </Button>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="subtitle1" gutterBottom>
                      Tu Calificación
                    </Typography>
                    <Rating
                      name="rating"
                      value={rating}
                      onChange={(event, newValue) => {
                        setRating(newValue);
                      }}
                      size="large"
                      sx={{ mb: 3 }}
                    />

                    <Typography variant="subtitle1" gutterBottom>
                      Tu Reseña
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      placeholder="Comparte tu experiencia con este lugar..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    {error && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                      </Alert>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting || !rating || !reviewText.trim()}
                        sx={{ minWidth: 120 }}
                      >
                        {submitting ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Publicando...
                          </>
                        ) : (
                          "Publicar Reseña"
                        )}
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
