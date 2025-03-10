"use client";

import React, { useState, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CollectionsIcon from "@mui/icons-material/Collections";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RateReviewIcon from "@mui/icons-material/RateReview";
import StarIcon from "@mui/icons-material/Star";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { TabPanel } from "@/components/ui/TabPanel";
import { supabase } from "@/lib/supabase";
import { getPlacePhotoUrl } from "@/lib/googlePlaces";

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

  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.user) {
      router.push("/auth?mode=login");
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
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
          .eq("user_id", authState.user.id)
          .order("created_at", { ascending: false });

        if (reviewsError) {
          throw reviewsError;
        }

        setReviews(reviewsData || []);

        // Fetch user collections
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select("*, collection_places(count)")
            .eq("user_id", authState.user.id);

        if (collectionsError) {
          throw collectionsError;
        }

        setCollections(collectionsData || []);

        // Fetch saved places
        const { data: savedPlacesData, error: savedPlacesError } =
          await supabase
            .from("collection_places")
            .select("*, collections(name)")
            .eq("collections.user_id", authState.user.id);

        if (savedPlacesError) {
          throw savedPlacesError;
        }

        setSavedPlaces(savedPlacesData || []);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authState.user, router]);

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
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
  };

  const handleSaveProfile = async () => {
    if (!authState.user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editName,
          bio: editBio,
        })
        .eq("id", authState.user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setProfile({
        ...profile,
        full_name: editName,
        bio: editBio,
      });

      handleEditDialogClose();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      alert("Error al actualizar el perfil: " + err.message);
    }
  };

  const handleCreateCollection = async () => {
    if (!authState.user || !newCollectionName.trim()) return;

    try {
      const { error } = await supabase.from("collections").insert({
        user_id: authState.user.id,
        name: newCollectionName.trim(),
      });

      if (error) {
        throw error;
      }

      // Refresh collections
      const { data } = await supabase
        .from("collections")
        .select("*, collection_places(count)")
        .eq("user_id", authState.user.id);

      setCollections(data || []);
      setShowCollectionDialog(false);
      setNewCollectionName("");
    } catch (err: any) {
      console.error("Error creating collection:", err);
      alert("Error al crear la colección: " + err.message);
    }
  };

  const handleViewPlace = (id: string) => {
    router.push(`/place/${id}`);
  };

  const handleViewCollection = (id: number) => {
    router.push(`/collection/${id}`);
  };

  const getPlaceImage = (place: any) => {
    if (place.place_photo) {
      return getPlacePhotoUrl(place.place_photo);
    }
    return "/place-placeholder.jpg";
  };

  const getCollectionImage = (collection: any) => {
    // Try to get the first place photo from the collection
    if (
      collection.collection_places &&
      collection.collection_places.length > 0
    ) {
      const firstPlace = collection.collection_places[0];
      if (firstPlace.place_photo) {
        return getPlacePhotoUrl(firstPlace.place_photo);
      }
    }

    // Fallback to placeholder images
    return "/collection-placeholder.jpg";
  };

  // Show loading state
  if (authState.isLoading) {
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
            <Typography>Cargando perfil...</Typography>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Profile Header */}
            <Box sx={{ py: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={2}>
                  <Avatar
                    src={profile?.avatar_url || "/user-placeholder.jpg"}
                    alt={profile?.full_name || "Usuario"}
                    sx={{
                      width: { xs: 120, md: 150 },
                      height: { xs: 120, md: 150 },
                      mx: { xs: "auto", md: 0 },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Typography variant="h4" component="h1" fontWeight="bold">
                      {profile?.full_name || "Usuario"}
                    </Typography>
                    <IconButton
                      aria-label="more"
                      onClick={handleMenuClick}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleEditProfile}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        Editar Perfil
                      </MenuItem>
                    </Menu>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    {profile?.bio || "Sin biografía"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Box sx={{ textAlign: "center", mr: 4 }}>
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight="bold"
                      >
                        {reviews.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reseñas
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", mr: 4 }}>
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight="bold"
                      >
                        {savedPlaces.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lugares Guardados
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight="bold"
                      >
                        {collections.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Colecciones
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={2}
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-end" },
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowCollectionDialog(true)}
                    startIcon={<CollectionsIcon />}
                  >
                    Nueva Colección
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Tabs */}
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="profile tabs"
                  centered
                >
                  <Tab
                    icon={<RateReviewIcon />}
                    label="Mis Reseñas"
                    id="tab-0"
                    aria-controls="tabpanel-0"
                  />
                  <Tab
                    icon={<BookmarkIcon />}
                    label="Lugares Guardados"
                    id="tab-1"
                    aria-controls="tabpanel-1"
                  />
                  <Tab
                    icon={<CollectionsIcon />}
                    label="Mis Colecciones"
                    id="tab-2"
                    aria-controls="tabpanel-2"
                  />
                </Tabs>
              </Box>

              {/* Reviews Tab */}
              <TabPanel value={tabValue} index={0}>
                {reviews.length > 0 ? (
                  <Grid container spacing={3}>
                    {reviews.map((review) => (
                      <Grid item xs={12} key={review.id}>
                        <Card
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: "100%", md: "30%" },
                              height: { xs: 200, md: "auto" },
                              position: "relative",
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewPlace(review.place_id)}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                minHeight: 200,
                                backgroundImage: `url(${getPlaceImage(
                                  review
                                )})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                width: "100%",
                                p: 2,
                                background:
                                  "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{ color: "white" }}
                              >
                                {review.place_name}
                              </Typography>
                            </Box>
                          </Box>
                          <CardContent
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Rating
                                value={review.rating}
                                readOnly
                                precision={0.5}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {new Date(review.created_at).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </Typography>
                            </Box>
                            <Typography variant="body1" paragraph>
                              {review.comment}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      Aún no has escrito reseñas
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push("/places")}
                      sx={{ mt: 2 }}
                    >
                      Explorar Lugares
                    </Button>
                  </Box>
                )}
              </TabPanel>

              {/* Saved Places Tab */}
              <TabPanel value={tabValue} index={1}>
                {savedPlaces.length > 0 ? (
                  <Grid container spacing={3}>
                    {savedPlaces.map((place) => (
                      <Grid item xs={12} sm={6} md={4} key={place.id}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            height: "100%",
                            cursor: "pointer",
                            transition: "transform 0.3s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                            },
                          }}
                          onClick={() => handleViewPlace(place.place_id)}
                        >
                          <Box
                            sx={{
                              height: 180,
                              backgroundImage: `url(${getPlaceImage(place)})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              position: "relative",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                bgcolor: "primary.main",
                                color: "white",
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                fontSize: "0.75rem",
                              }}
                            >
                              {place.collections?.name}
                            </Box>
                          </Box>
                          <CardContent>
                            <Typography variant="h6" component="div" noWrap>
                              {place.place_name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <LocationOnIcon
                                fontSize="small"
                                color="action"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {place.place_address}
                              </Typography>
                            </Box>
                            {place.place_rating && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                <Rating
                                  value={place.place_rating}
                                  readOnly
                                  size="small"
                                  precision={0.5}
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No tienes lugares guardados
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push("/places")}
                      sx={{ mt: 2 }}
                    >
                      Explorar Lugares
                    </Button>
                  </Box>
                )}
              </TabPanel>

              {/* Collections Tab */}
              <TabPanel value={tabValue} index={2}>
                {collections.length > 0 ? (
                  <Grid container spacing={3}>
                    {collections.map((collection) => (
                      <Grid item xs={12} sm={6} md={4} key={collection.id}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            height: "100%",
                            cursor: "pointer",
                            transition: "transform 0.3s",
                            "&:hover": {
                              transform: "translateY(-5px)",
                            },
                          }}
                          onClick={() => handleViewCollection(collection.id)}
                        >
                          <Box
                            sx={{
                              height: 180,
                              backgroundImage: `url(${getCollectionImage(
                                collection
                              )})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                          <CardContent>
                            <Typography variant="h6" component="div">
                              {collection.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {collection.collection_places?.length || 0}{" "}
                              lugares
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          p: 3,
                          cursor: "pointer",
                          border: "2px dashed",
                          borderColor: "divider",
                          "&:hover": {
                            borderColor: "primary.main",
                          },
                        }}
                        onClick={() => setShowCollectionDialog(true)}
                      >
                        <CollectionsIcon
                          sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                        />
                        <Typography variant="h6" component="div" align="center">
                          Crear Nueva Colección
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      No tienes colecciones
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setShowCollectionDialog(true)}
                      sx={{ mt: 2 }}
                    >
                      Crear Colección
                    </Button>
                  </Box>
                )}
              </TabPanel>
            </Box>
          </>
        )}
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Biografía"
            multiline
            rows={4}
            fullWidth
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
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

      {/* Create Collection Dialog */}
      <Dialog
        open={showCollectionDialog}
        onClose={() => setShowCollectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nueva Colección</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la Colección"
            type="text"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCollectionDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCollection}
            variant="contained"
            color="primary"
            disabled={!newCollectionName.trim()}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
