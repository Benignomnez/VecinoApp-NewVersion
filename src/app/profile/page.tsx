"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CollectionsIcon from "@mui/icons-material/Collections";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RateReviewIcon from "@mui/icons-material/RateReview";
import StarIcon from "@mui/icons-material/Star";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CoolIcon from "@mui/icons-material/AcUnit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { TabPanel } from "@/components/ui/TabPanel";
import { supabase } from "@/lib/supabase";
import { getPlacePhotoUrl } from "@/lib/googlePlaces";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import toast from "react-hot-toast";
import Image from "next/image";

// Data for the rating distribution chart
const ratingDistribution = [
  { rating: 5, count: 8 },
  { rating: 4, count: 5 },
  { rating: 3, count: 1 },
  { rating: 2, count: 2 },
  { rating: 1, count: 3 },
];

// Data for review votes
const reviewVotes = {
  useful: 37,
  funny: 1,
  cool: 4,
};

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const { authState, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
  });
  const [isFileUploading, setIsFileUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authState.user && !authState.isLoading) {
      // Add a brief delay to prevent immediate redirects that can cause loops
      const timer = setTimeout(() => {
        // Store a flag to prevent multiple redirects
        const redirectFlag = sessionStorage.getItem("profileRedirectAttempted");
        if (!redirectFlag) {
          // Set the flag to prevent multiple redirects
          sessionStorage.setItem("profileRedirectAttempted", "true");
          router.push("/auth?mode=login");
        }
      }, 500);

      return () => clearTimeout(timer);
    } else if (authState.user) {
      // Clear the redirect flag when we have a user
      sessionStorage.removeItem("profileRedirectAttempted");

      const fetchUserData = async () => {
        if (!authState.user) return;

        try {
          setLoading(true);
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authState.user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          setProfile(profileData);
          setEditName(profileData.full_name || "");
          setEditBio(profileData.bio || "");

          // Fetch user reviews
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select("*, profiles(*)")
            .eq("profile_id", authState.user.id)
            .order("created_at", { ascending: false });

          if (reviewsError) {
            throw reviewsError;
          }

          setReviews(reviewsData || []);

          // Fetch saved places (bookmarks)
          const { data: savedData, error: savedError } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("profile_id", authState.user.id)
            .order("created_at", { ascending: false });

          if (savedError) {
            throw savedError;
          }

          setSavedPlaces(savedData || []);

          // Fetch collections
          const { data: collectionsData, error: collectionsError } =
            await supabase
              .from("collections")
              .select("*")
              .eq("profile_id", authState.user.id)
              .order("created_at", { ascending: false });

          if (collectionsError) {
            throw collectionsError;
          }

          setCollections(collectionsData || []);

          // Set profile data for the form
          setProfileData({
            full_name: profileData.full_name || "",
            bio: profileData.bio || "",
            location: profileData.location || "",
            website: profileData.website || "",
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(
            "No pudimos cargar tus datos. Por favor, intenta de nuevo más tarde."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [authState.isLoading, authState.user, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { error } = await updateProfile({
        ...profileData,
      });

      if (error) {
        throw error;
      }

      setIsEditing(false);
      toast.success("Perfil actualizado con éxito");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Por favor ingresa un nombre para la colección");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name: newCollectionName,
          profile_id: authState.user?.id,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setCollections([...collections, data[0]]);
      }

      setShowCollectionDialog(false);
      setNewCollectionName("");
      toast.success("Colección creada con éxito");
    } catch (err) {
      console.error("Error creating collection:", err);
      toast.error("Error al crear la colección");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlace = (id: string) => {
    router.push(`/place/${id}`);
  };

  const handleViewCollection = (id: number) => {
    // router.push(`/collections/${id}`);
  };

  const getPlaceImage = (place: any) => {
    if (place.photo_reference) {
      return getPlacePhotoUrl(place.photo_reference, 400);
    }
    return "/restaurant1.jpg";
  };

  const getCollectionImage = (collection: any) => {
    return `/collection${(collection.id % 4) + 1}.jpg`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    try {
      setIsFileUploading(true);
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${authState.user?.id}-${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await updateProfile({
        avatar_url: publicUrl,
      });

      if (updateError) {
        throw updateError;
      }

      // Update the current session
      await supabase.auth.refreshSession();

      toast.success("Foto de perfil actualizada con éxito");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(
        `Error al subir la imagen: ${error.message || "Error desconocido"}`
      );
    } finally {
      setIsFileUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (authState.isLoading) {
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ my: 8, textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando tu perfil...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Si esto tarda demasiado, puedes
            <Button
              color="primary"
              onClick={() => router.push("/")}
              sx={{ ml: 1 }}
            >
              volver al inicio
            </Button>
          </Typography>
        </Container>
      </MainLayout>
    );
  }

  if (authState.error) {
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ my: 4 }}>
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
          >
            <Typography variant="h5" gutterBottom color="error">
              Error de autenticación
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {authState.error}
            </Alert>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}
            >
              <Button variant="contained" onClick={() => router.push("/")}>
                Volver al inicio
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </Box>
          </Paper>
        </Container>
      </MainLayout>
    );
  }

  if (!authState.user) {
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ my: 4 }}>
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
          >
            <Typography variant="h5" gutterBottom color="primary">
              Acceso restringido
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Debes iniciar sesión para ver tu perfil
            </Alert>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}
            >
              <Button variant="outlined" onClick={() => router.push("/")}>
                Ir al inicio
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push("/auth?mode=login")}
              >
                Iniciar sesión
              </Button>
            </Box>
          </Paper>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header with background */}
      <Box
        sx={{
          bgcolor: "#d32323",
          py: 1,
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left column - Profile info */}
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box position="relative" display="inline-block">
                <Avatar
                  src={
                    authState.user.avatar_url
                      ? // If the avatar URL contains "/avatars/" replace it with "/profiles/"
                        authState.user.avatar_url.replace(
                          "/avatars/",
                          "/profiles/"
                        )
                      : "/default-avatar.png"
                  }
                  alt={authState.user.full_name}
                  sx={{
                    width: 200,
                    height: 200,
                    border: "2px solid #fff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    mb: 2,
                  }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <IconButton
                  size="small"
                  onClick={handleAvatarClick}
                  disabled={isFileUploading}
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 5,
                    bgcolor: "white",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  {isFileUploading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <CameraAltIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>

              <Typography variant="h4" fontWeight="bold" mt={2}>
                {authState.user.full_name || "Usuario"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 1,
                }}
              >
                <LocationOnIcon
                  fontSize="small"
                  sx={{ color: "text.secondary", mr: 0.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {profileData.location || "Santo Domingo, RD"}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {authState.user.created_at
                  ? `${Math.floor(
                      (new Date().getTime() -
                        new Date(authState.user.created_at).getTime()) /
                        (1000 * 60 * 60 * 24 * 30)
                    )} meses`
                  : "6 años, 1 mes"}
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={isEditing ? handleSaveProfile : handleEditProfile}
              >
                {isEditing ? "Guardar Perfil" : "Editar Perfil"}
              </Button>
            </Box>

            {/* User stats */}
            <Grid container spacing={1} sx={{ textAlign: "center", mb: 4 }}>
              <Grid item xs={4}>
                <Typography variant="h5" fontWeight="bold">
                  {collections.length || 60}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amigos
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" fontWeight="bold">
                  {savedPlaces.length || 27}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fotos
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h5" fontWeight="bold">
                  {reviews.length || 19}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reseñas
                </Typography>
              </Grid>
            </Grid>

            {/* Profile navigation sidebar */}
            <List
              component="nav"
              sx={{ width: "100%", bgcolor: "background.paper", mb: 4 }}
            >
              <ListItem button selected={true}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "transparent" }}>
                    <PeopleIcon sx={{ color: "text.secondary" }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Información General"
                  secondary="Perfil público"
                />
              </ListItem>

              <ListItem button>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "transparent" }}>
                    <RateReviewIcon sx={{ color: "text.secondary" }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Reseñas"
                  secondary={`${reviews.length || 19} reseñas`}
                />
              </ListItem>

              <ListItem button>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "transparent" }}>
                    <PhotoCameraIcon sx={{ color: "text.secondary" }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Fotos"
                  secondary={`${savedPlaces.length || 27} fotos`}
                />
              </ListItem>

              <ListItem button>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "transparent" }}>
                    <BookmarkIcon sx={{ color: "text.secondary" }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Favoritos"
                  secondary={`${collections.length || 2} colecciones`}
                />
              </ListItem>
            </List>
          </Grid>

          {/* Right column - Content */}
          <Grid item xs={12} md={9}>
            {/* Rating distribution section */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Distribución de Calificaciones
                </Typography>
                <Box sx={{ mb: 3 }}>
                  {ratingDistribution.map((item) => (
                    <Box
                      key={item.rating}
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <Typography sx={{ minWidth: 80 }}>
                        {item.rating}{" "}
                        {item.rating === 1 ? "estrella" : "estrellas"}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(item.count / 19) * 100}
                        sx={{
                          flexGrow: 1,
                          height: 12,
                          borderRadius: 1,
                          backgroundColor: "#ebebeb",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor:
                              item.rating >= 4
                                ? "#d32323"
                                : item.rating === 3
                                ? "#ffa500"
                                : "#c5c5c5",
                          },
                        }}
                      />
                      <Typography sx={{ ml: 1, minWidth: 20 }}>
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Votos en Reseñas
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ThumbUpIcon sx={{ mr: 1, color: "#5086ec" }} />
                    <Typography variant="body2">Útil</Typography>
                    <Typography
                      variant="body2"
                      sx={{ ml: "auto", fontWeight: "bold" }}
                    >
                      {reviewVotes.useful}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EmojiEmotionsIcon sx={{ mr: 1, color: "#ffd700" }} />
                    <Typography variant="body2">Divertida</Typography>
                    <Typography
                      variant="body2"
                      sx={{ ml: "auto", fontWeight: "bold" }}
                    >
                      {reviewVotes.funny}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CoolIcon sx={{ mr: 1, color: "#00bcd4" }} />
                    <Typography variant="body2">Interesante</Typography>
                    <Typography
                      variant="body2"
                      sx={{ ml: "auto", fontWeight: "bold" }}
                    >
                      {reviewVotes.cool}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ mt: 3 }}
                >
                  Reconocimientos
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    icon={
                      <ThumbUpIcon
                        fontSize="small"
                        sx={{ color: "#5086ec !important" }}
                      />
                    }
                    label="37"
                    variant="outlined"
                    sx={{ borderColor: "#5086ec" }}
                  />
                  <Chip
                    icon={
                      <EmojiEmotionsIcon
                        fontSize="small"
                        sx={{ color: "#ffd700 !important" }}
                      />
                    }
                    label="1"
                    variant="outlined"
                    sx={{ borderColor: "#ffd700" }}
                  />
                  <Chip
                    icon={
                      <CoolIcon
                        fontSize="small"
                        sx={{ color: "#00bcd4 !important" }}
                      />
                    }
                    label="4"
                    variant="outlined"
                    sx={{ borderColor: "#00bcd4" }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* "Things I Like" section */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Intereses Culinarios
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "#f5f5f5",
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    <RestaurantIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2">Alta Cocina</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "#f5f5f5",
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    <LocalCafeIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2">Cafeterías</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "#f5f5f5",
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    <FastfoodIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2">Comida Rápida</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Mi Comida Preferida
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}
                >
                  <Box
                    component="img"
                    src="/restaurant1.jpg"
                    alt="Food image"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    component="img"
                    src="/restaurant2.jpg"
                    alt="Food image"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    component="img"
                    src="/restaurant3.jpg"
                    alt="Food image"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Reviews section */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Reseñas
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => router.push("/write-review")}
                >
                  Escribir reseña
                </Button>
              </Box>

              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <Paper key={index} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight="bold">
                          {review.place_name || "Restaurante Popular"}
                        </Typography>
                        <Box
                          sx={{ ml: 2, display: "flex", alignItems: "center" }}
                        >
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Santo Domingo
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Rating
                          value={review.rating}
                          readOnly
                          precision={0.5}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.created_at).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {review.content ||
                        "¡Excelente servicio y comida deliciosa! Me encantó la atención al cliente. Los platos tienen una presentación impecable y los sabores son auténticos. Definitivamente regresaré pronto."}
                    </Typography>

                    {/* Review photo */}
                    {review.photos && review.photos.length > 0 ? (
                      <Box
                        component="img"
                        src={review.photos[0]}
                        alt="Review photo"
                        sx={{
                          width: "100%",
                          maxHeight: 300,
                          objectFit: "cover",
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src="/restaurant1.jpg"
                        alt="Example restaurant"
                        sx={{
                          width: "100%",
                          maxHeight: 300,
                          objectFit: "cover",
                          borderRadius: 1,
                          mb: 2,
                        }}
                      />
                    )}

                    {/* Review actions */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ThumbUpIcon />}
                        sx={{ borderRadius: 4 }}
                      >
                        Útil
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EmojiEmotionsIcon />}
                        sx={{ borderRadius: 4 }}
                      >
                        Divertida
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CoolIcon />}
                        sx={{ borderRadius: 4 }}
                      >
                        Interesante
                      </Button>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="h6">No hay reseñas todavía</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    ¡Comparte tu experiencia en restaurantes, cafeterías y más!
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push("/write-review")}
                  >
                    Escribir tu primera reseña
                  </Button>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={handleEditDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar perfil</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="full_name"
            value={profileData.full_name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Biografía"
            name="bio"
            multiline
            rows={3}
            value={profileData.bio}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Ubicación"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Sitio web"
            name="website"
            value={profileData.website}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancelar</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
