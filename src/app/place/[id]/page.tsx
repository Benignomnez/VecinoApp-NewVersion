"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import PhotoIcon from "@mui/icons-material/Photo";
import InfoIcon from "@mui/icons-material/Info";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { TabPanel } from "@/components/ui/TabPanel";
import { PlaceResult } from "@/lib/googlePlaces";
import { supabase } from "@/lib/supabase";
import {
  getPlaceDetails,
  PlaceDetailsResponse,
  getPlacePhotoUrl,
} from "@/lib/googlePlaces";
import GoogleMap from "@/components/GoogleMap";
import Paper from "@mui/material/Paper";

export default function PlaceDetailPage() {
  const [tabValue, setTabValue] = useState(0);
  const [place, setPlace] = useState<
    | (PlaceResult & {
        reviews?: {
          author_name: string;
          rating: number;
          text: string;
          time: number;
          profile_photo_url?: string;
        }[];
        website?: string;
        formatted_phone_number?: string;
        opening_hours?: {
          open_now?: boolean;
          weekday_text?: string[];
        };
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<number | "">("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [userCollections, setUserCollections] = useState<
    { id: number; name: string }[]
  >([]);

  const { authState } = useAuth();
  const router = useRouter();
  const params = useParams();
  const placeId = params.id as string;

  // Fetch place details
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPlaceDetails(placeId);

        if (response.status === "OK") {
          if (response.result) {
            if (response.result.photos && response.result.photos.length > 0) {
              const sortedPhotos = [...response.result.photos].sort((a, b) =>
                a.photo_reference.localeCompare(b.photo_reference)
              );
              response.result.photos = sortedPhotos;
            }

            setPlace(response.result);
          } else {
            setError("No se encontraron detalles para este lugar");
          }
        } else {
          setError(`Error: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
        setError("Error al cargar los detalles del lugar");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [placeId]);

  // Fetch user collections when dialog opens
  useEffect(() => {
    if (showCollectionDialog && authState.user) {
      const fetchUserCollections = async () => {
        try {
          const { data, error } = await supabase
            .from("collections")
            .select("id, name")
            .eq("user_id", authState.user?.id);

          if (error) {
            console.error("Error fetching collections:", error);
          } else {
            setUserCollections(data || []);
          }
        } catch (err) {
          console.error("Error fetching collections:", err);
        }
      };

      fetchUserCollections();
    }
  }, [showCollectionDialog, authState.user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSavePlace = () => {
    if (!authState.user) {
      router.push("/auth?mode=login");
      return;
    }

    setIsSaved(!isSaved);

    if (!isSaved) {
      setShowCollectionDialog(true);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWriteReview = () => {
    if (!authState.user) {
      router.push("/auth?mode=login");
      return;
    }

    setShowReviewDialog(true);
    handleMenuClose();
  };

  const handleReportPlace = () => {
    // Implement report functionality
    handleMenuClose();
  };

  const handleCollectionDialogClose = () => {
    setShowCollectionDialog(false);
    setSelectedCollection("");
    setNewCollectionName("");
  };

  const handleSaveToCollection = async () => {
    if (!authState.user || !place) {
      return;
    }

    try {
      let collectionId = selectedCollection;

      // If user is creating a new collection
      if (!collectionId && newCollectionName.trim()) {
        // Create new collection
        const { data: newCollection, error: collectionError } = await supabase
          .from("collections")
          .insert({
            user_id: authState.user.id,
            name: newCollectionName.trim(),
          })
          .select("id")
          .single();

        if (collectionError) {
          console.error("Error creating collection:", collectionError);
          return;
        }

        collectionId = newCollection.id;
      }

      if (collectionId) {
        // Save place to collection
        const { error: saveError } = await supabase
          .from("collection_places")
          .insert({
            collection_id: collectionId,
            place_id: place.place_id,
            place_name: place.name,
            place_address: place.formatted_address || place.vicinity,
            place_photo: place.photos?.[0]?.photo_reference || null,
            place_rating: place.rating || null,
          });

        if (saveError) {
          console.error("Error saving place to collection:", saveError);
        } else {
          // Show success message
          alert("¡Lugar guardado en la colección!");
        }
      }
    } catch (err) {
      console.error("Error saving to collection:", err);
    }

    handleCollectionDialogClose();
  };

  const handleReviewDialogClose = () => {
    setShowReviewDialog(false);
    setReviewRating(null);
    setReviewText("");
  };

  const handleSubmitReview = async () => {
    if (!authState.user || !reviewRating || !reviewText.trim() || !place) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        profile_id: authState.user.id,
        place_id: place.place_id,
        rating: reviewRating,
        content: reviewText,
      });

      if (error) {
        setError(error.message);
      } else {
        // Refresh the reviews
        const { data } = await supabase
          .from("reviews")
          .select("*, profiles(*)")
          .eq("place_id", place.place_id)
          .order("created_at", { ascending: false });

        if (data) {
          // Update the place reviews with the new data
          // In a real app, you would update the place state with the new reviews
          console.log("New reviews:", data);
        }

        handleReviewDialogClose();
        // Show success message
        alert("¡Reseña publicada con éxito!");
      }
    } catch (err: any) {
      setError(err.message || "Error al publicar la reseña");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowPhotoDialog(true);
  };

  const handlePhotoDialogClose = () => {
    setShowPhotoDialog(false);
  };

  const handleNextPhoto = () => {
    if (place?.photos) {
      setCurrentPhotoIndex(
        (prevIndex) => (prevIndex + 1) % place.photos!.length
      );
    }
  };

  const handlePrevPhoto = () => {
    if (place?.photos) {
      setCurrentPhotoIndex(
        (prevIndex) =>
          (prevIndex - 1 + place.photos!.length) % place.photos!.length
      );
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (error || !place) {
    return (
      <MainLayout>
        <Container>
          <Box sx={{ my: 4 }}>
            <Alert severity="error">
              {error || "No se pudo cargar la información del lugar"}
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/")}
              sx={{ mt: 2 }}
            >
              Volver al Inicio
            </Button>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Place Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 4,
        }}
      >
        <Container>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                {place.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Rating value={place.rating} precision={0.1} readOnly />
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {place.rating} ({place.user_ratings_total} reseñas)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {place.formatted_address}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                {place.types?.map((type, index) => (
                  <Chip
                    key={index}
                    label={type.replace("_", " ")}
                    size="small"
                    sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={
                    isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />
                  }
                  onClick={handleSavePlace}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "grey.100",
                    },
                  }}
                >
                  {isSaved ? "Guardado" : "Guardar"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "grey.100",
                    },
                  }}
                >
                  Compartir
                </Button>
                <IconButton
                  aria-label="more"
                  aria-controls="place-menu"
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "grey.100",
                    },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id="place-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleWriteReview}>
                    Escribir Reseña
                  </MenuItem>
                  <MenuItem onClick={handleReportPlace}>
                    Reportar Lugar
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Place Photos */}
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={1}>
          {place.photos?.slice(0, 4).map((photo, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box
                sx={{
                  height: { xs: 150, md: 200 },
                  backgroundImage: `url(${getPlacePhotoUrl(
                    photo.photo_reference
                  )})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 2,
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: "rgba(0, 0, 0, 0.3)",
                      borderRadius: 2,
                    },
                  },
                }}
                onClick={() => handlePhotoClick(index)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Place Content */}
      <Container sx={{ my: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column - Info */}
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="place tabs"
              >
                <Tab
                  label="Información"
                  icon={<InfoIcon />}
                  iconPosition="start"
                />
                <Tab label="Reseñas" icon={<StarIcon />} iconPosition="start" />
                <Tab label="Fotos" icon={<PhotoIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Acerca de {place.name}
              </Typography>
              <Typography variant="body1" paragraph>
                {place.name} es un restaurante tradicional dominicano ubicado en
                el corazón de Santo Domingo. Ofrece una auténtica experiencia
                culinaria con platos típicos de la gastronomía dominicana en un
                ambiente acogedor y festivo.
              </Typography>
              <Typography variant="body1" paragraph>
                El restaurante es conocido por su excelente sancocho, mofongo,
                tostones y otras delicias locales. También cuenta con música en
                vivo algunos días de la semana, lo que añade un toque especial a
                la experiencia.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Información de Contacto
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocationOnIcon color="action" sx={{ mr: 2 }} />
                <Typography variant="body1">
                  {place.formatted_address}
                </Typography>
              </Box>
              {place.formatted_phone_number && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PhoneIcon color="action" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    {place.formatted_phone_number}
                  </Typography>
                </Box>
              )}
              {place.website && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <LanguageIcon color="action" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {place.website}
                    </a>
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Horario
              </Typography>
              {place.opening_hours?.weekday_text?.map((day, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <AccessTimeIcon color="action" sx={{ mr: 2, fontSize: 20 }} />
                  <Typography variant="body1">{day}</Typography>
                </Box>
              ))}
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">
                  Reseñas ({place.reviews?.length || 0})
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleWriteReview}
                >
                  Escribir Reseña
                </Button>
              </Box>

              {place.reviews?.map((review, index) => (
                <Card
                  key={review.id || `review-${index}`}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {review.author_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.time * 1000).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
                    <Typography variant="body1">{review.text}</Typography>
                  </CardContent>
                </Card>
              ))}
            </TabPanel>

            {/* Photos Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                {place.photos?.map((photo, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${getPlacePhotoUrl(
                          photo.photo_reference
                        )})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: 2,
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.9,
                        },
                      }}
                      onClick={() => handlePhotoClick(index)}
                    />
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Grid>

          {/* Right Column - Map and Additional Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Ubicación
              </Typography>
              {place.geometry && (
                <GoogleMap
                  lat={place.geometry.location.lat}
                  lng={place.geometry.location.lng}
                  markerTitle={place.name}
                />
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Categorías
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {place.types &&
                  place.types.map((type) => (
                    <Chip
                      key={type}
                      label={type
                        .replace(/_/g, " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                      size="small"
                    />
                  ))}
              </Box>
            </Paper>

            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lugares Cercanos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Próximamente...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Collection Dialog */}
      <Dialog
        open={showCollectionDialog}
        onClose={handleCollectionDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Guardar en Colección</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel id="collection-select-label">
              Seleccionar Colección
            </InputLabel>
            <Select
              labelId="collection-select-label"
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value as number)}
              label="Seleccionar Colección"
            >
              {userCollections.map((collection) => (
                <MenuItem key={collection.id} value={collection.id}>
                  {collection.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" gutterBottom>
            O crear una nueva colección:
          </Typography>
          <TextField
            fullWidth
            label="Nombre de la Colección"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollectionDialogClose}>Cancelar</Button>
          <Button
            onClick={handleSaveToCollection}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={showReviewDialog}
        onClose={handleReviewDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Escribir Reseña</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {place.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Tu Calificación:
            </Typography>
            <Rating
              value={reviewRating}
              onChange={(event, newValue) => {
                setReviewRating(newValue);
              }}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Tu Reseña"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Comparte tu experiencia con este lugar..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewDialogClose}>Cancelar</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color="primary"
            disabled={!reviewRating || !reviewText.trim()}
          >
            Publicar Reseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog
        open={showPhotoDialog}
        onClose={handlePhotoDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          {place.photos && place.photos.length > 0 && (
            <Box
              sx={{
                width: "100%",
                height: 500,
                backgroundImage: `url(${getPlacePhotoUrl(
                  place.photos[currentPhotoIndex].photo_reference,
                  800
                )})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                bgcolor: "black",
              }}
            />
          )}
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
            onClick={handlePhotoDialogClose}
          >
            <MoreVertIcon />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
            }}
          >
            <Button color="inherit" onClick={handlePrevPhoto}>
              Anterior
            </Button>
            <Typography>
              {currentPhotoIndex + 1} de {place.photos?.length}
            </Typography>
            <Button color="inherit" onClick={handleNextPhoto}>
              Siguiente
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
