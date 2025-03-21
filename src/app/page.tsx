"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import Rating from "@mui/material/Rating";
import Chip from "@mui/material/Chip";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MainLayout from "@/components/layout/MainLayout";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import HotelIcon from "@mui/icons-material/Hotel";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {
  getPlacePhotoUrl,
  searchPlaces,
  getPlaceDetails,
  PlaceResult,
} from "@/lib/googlePlaces";
import { supabase } from "@/lib/supabase";
import Avatar from "@mui/material/Avatar";
import RateReviewIcon from "@mui/icons-material/RateReview";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ShopIcon from "@mui/icons-material/Shop";
import AppleIcon from "@mui/icons-material/Apple";
import WifiIcon from "@mui/icons-material/Wifi";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import Paper from "@mui/material/Paper";
import { keyframes } from "@mui/system";
import { motion } from "framer-motion";
import Zoom from "@mui/material/Zoom";
import Grow from "@mui/material/Grow";
import Fade from "@mui/material/Fade";
import Autocomplete from "@mui/material/Autocomplete";
import toast from "react-hot-toast";
import HeroSection from "@/components/HeroSection";
import PopularCategories from "@/components/PopularCategories";

// Categories data
const categories = [
  {
    id: 1,
    name: "Restaurantes",
    count: 865,
    icon: "RestaurantIcon",
    color: "#e63946",
  },
  {
    id: 2,
    name: "Playas",
    count: 243,
    icon: "BeachAccessIcon",
    color: "#00b4d8",
  },
  {
    id: 3,
    name: "Hoteles",
    count: 512,
    icon: "HotelIcon",
    color: "#457b9d",
  },
  {
    id: 4,
    name: "Bares",
    count: 347,
    icon: "LocalBarIcon",
    color: "#8338ec",
  },
  {
    id: 5,
    name: "Cafeterías",
    count: 189,
    icon: "LocalCafeIcon",
    color: "#fb8500",
  },
  {
    id: 6,
    name: "Servicios",
    count: 423,
    icon: "MiscellaneousServicesIcon",
    color: "#2a9d8f",
  },
  {
    id: 7,
    name: "Entretenimiento",
    count: 276,
    icon: "TheaterComedyIcon",
    color: "#f94144",
  },
  {
    id: 8,
    name: "Compras",
    count: 354,
    icon: "ShoppingBagIcon",
    color: "#6a994e",
  },
];

// Location options
const locations = [
  { value: "Santo Domingo", label: "Santo Domingo" },
  { value: "Santiago", label: "Santiago" },
  { value: "Puerto Plata", label: "Puerto Plata" },
  { value: "Punta Cana", label: "Punta Cana" },
  { value: "La Romana", label: "La Romana" },
];

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const typing = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const blink = keyframes`
  50% {
    border-color: transparent;
  }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Santo Domingo");
  const [featuredBusinesses, setFeaturedBusinesses] = useState<PlaceResult[]>(
    []
  );
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Animation states
  const [showMockup, setShowMockup] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const searchText = "Buscar restaurantes, hoteles...";
  const typingRef = useRef(null);

  // Autocomplete states
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);

  // App mockup states
  const [showMockupSuggestions, setShowMockupSuggestions] = useState(false);
  const mockupSuggestions = [
    "Restaurante El Conuco",
    "Adrian Tropical",
    "Jalao",
    "Pat'e Palo",
    "La Cassina",
  ];

  // Check for email confirmation from URL parameters
  useEffect(() => {
    const emailConfirmed = searchParams.get("emailConfirmed");
    if (emailConfirmed === "true") {
      // Show a welcome toast if email was confirmed
      toast.success("¡Cuenta verificada! Bienvenido a VecinoApp", {
        duration: 5000,
      });

      // Could clean the URL here if desired
      // window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  useEffect(() => {
    // Show mockup with delay for animation
    const timer = setTimeout(() => {
      setShowMockup(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Typing animation
    if (showMockup && typingIndex < searchText.length) {
      const typingTimer = setTimeout(() => {
        setTypingIndex((prev) => prev + 1);
      }, 100);

      return () => clearTimeout(typingTimer);
    }
  }, [showMockup, typingIndex]);

  // Show mockup suggestions after typing animation completes
  useEffect(() => {
    if (typingIndex === searchText.length) {
      const timer = setTimeout(() => {
        setShowMockupSuggestions(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [typingIndex, searchText.length]);

  // Fetch featured businesses and recent reviews
  useEffect(() => {
    const fetchFeaturedBusinesses = async () => {
      setLoading(true);
      try {
        // Fetch popular restaurants in Santo Domingo
        const response = await searchPlaces(
          "restaurantes populares",
          "Santo Domingo",
          "restaurant"
        );

        if (
          response.status === "OK" &&
          response.results &&
          response.results.length > 0
        ) {
          // Take the first 4 results
          setFeaturedBusinesses(response.results.slice(0, 4));
        } else {
          console.error("No featured businesses found");
        }

        // Fetch recent reviews from Supabase
        try {
          // First try the proper join syntax if the relationship exists
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("reviews")
            .select(
              `
              id,
              place_id,
              rating,
              content,
              photos,
              created_at,
              profile_id,
              profiles:profile_id(id, full_name, avatar_url)
            `
            )
            .order("created_at", { ascending: false })
            .limit(3);

          if (reviewsError) {
            console.error("Error fetching reviews:", reviewsError);

            // Fallback to simpler query without the join if it fails
            const { data: fallbackData, error: fallbackError } = await supabase
              .from("reviews")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(3);

            if (fallbackError) {
              console.error("Fallback query also failed:", fallbackError);
            } else {
              setRecentReviews(fallbackData || []);
            }
          } else {
            setRecentReviews(reviewsData || []);
          }
        } catch (error) {
          console.error("Exception during reviews fetch:", error);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Error al cargar los datos. Por favor intente de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBusinesses();
  }, []);

  // Fetch autocomplete suggestions
  useEffect(() => {
    let active = true;

    if (!inputValue) {
      setOptions([]);
      return undefined;
    }

    const fetchSuggestions = async () => {
      setAutocompleteLoading(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(
            inputValue
          )}&location=${encodeURIComponent(location)}`
        );
        const data = await response.json();

        if (active && data.suggestions) {
          setOptions(data.suggestions);
        }
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      } finally {
        setAutocompleteLoading(false);
      }
    };

    // Debounce the API call to avoid making too many requests
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [inputValue, location]);

  const handleSearch = () => {
    console.log("Searching for:", { searchQuery, location });
    if (!searchQuery.trim()) {
      alert("Por favor ingrese un término de búsqueda");
      return;
    }

    router.push(
      `/places?query=${encodeURIComponent(
        searchQuery
      )}&location=${encodeURIComponent(location)}`
    );
  };

  const handleCategoryClick = (category: string) => {
    console.log("Searching by category:", category);
    router.push(`/places?type=${encodeURIComponent(category)}`);
  };

  const handleBusinessClick = (place_id: string) => {
    router.push(`/place/${place_id}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getBusinessImage = (business: PlaceResult) => {
    // Check if the place has photos from the API
    if (business.photos && business.photos.length > 0) {
      // Sort photos by reference to ensure consistency with other pages
      const sortedPhotos = [...business.photos].sort((a, b) =>
        a.photo_reference.localeCompare(b.photo_reference)
      );
      return getPlacePhotoUrl(sortedPhotos[0].photo_reference);
    }

    // Fallback to placeholder images based on type
    const businessType = business.types?.[0] || "restaurant";

    if (businessType.includes("restaurant") || businessType.includes("food")) {
      return "/restaurant1.jpg";
    } else if (
      businessType.includes("lodging") ||
      businessType.includes("hotel")
    ) {
      return "/hotel1.jpg";
    } else if (businessType.includes("beach")) {
      return "/beach1.jpg";
    } else if (businessType.includes("cafe")) {
      return "/cafe1.jpg";
    } else {
      return "/place1.jpg";
    }
  };

  const getBusinessType = (business: PlaceResult) => {
    if (!business.types || business.types.length === 0) {
      return "Negocio";
    }

    const type = business.types[0];

    if (type.includes("restaurant") || type.includes("food")) {
      return "Restaurante";
    } else if (type.includes("lodging")) {
      return "Hotel";
    } else if (type.includes("bar")) {
      return "Bar";
    } else if (type.includes("cafe")) {
      return "Cafetería";
    } else if (type.includes("store") || type.includes("shop")) {
      return "Tienda";
    } else if (type.includes("beach")) {
      return "Playa";
    } else if (type.includes("amusement") || type.includes("entertainment")) {
      return "Entretenimiento";
    } else {
      return "Negocio";
    }
  };

  return (
    <MainLayout>
      {/* Replace the old hero section with our new component */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        location={location}
        setLocation={setLocation}
        handleSearch={handleSearch}
        handleKeyPress={handleKeyPress}
        inputValue={inputValue}
        setInputValue={setInputValue}
        options={options}
        loading={autocompleteLoading}
        open={open}
        setOpen={setOpen}
      />

      {/* Categories Section */}
      <Container sx={{ my: 8 }}>
        <PopularCategories />
      </Container>

      {/* Featured Businesses Section */}
      <Box sx={{ bgcolor: "grey.50", py: 8 }}>
        <Container>
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            gutterBottom
          >
            Lugares Destacados
          </Typography>
          <Grid container spacing={3}>
            {featuredBusinesses.map((business) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={business.id || business.place_id}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s",
                    height: "100%",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-5px)",
                    },
                  }}
                  onClick={() => handleBusinessClick(business.place_id)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={getBusinessImage(business)}
                    alt={business.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div" noWrap>
                      {business.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Rating
                        value={business.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({business.user_ratings_total})
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 0.5 }}
                        >
                          {business.vicinity}
                        </Typography>
                      </Box>
                      <Chip
                        label={getBusinessType(business)}
                        size="small"
                        sx={{
                          bgcolor: "secondary.main",
                          color: "white",
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Recent Reviews Section */}
      <Container sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Reseñas Recientes
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : recentReviews.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No hay reseñas recientes disponibles
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {recentReviews.map((review) => (
              <Grid item xs={12} md={4} key={review.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={
                          review.profiles?.avatar_url || "/user-placeholder.jpg"
                        }
                        alt={review.profiles?.full_name || "Usuario"}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {review.profiles?.full_name || "Usuario"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {review.place_name || "Lugar"}
                    </Typography>
                    <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Call to Action Section */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 8 }}>
        <Container>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              gutterBottom
            >
              ¿Conoces un buen lugar?
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
              Comparte tu experiencia y ayuda a otros a descubrir los mejores
              lugares en República Dominicana
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
              onClick={() => router.push("/write-review")}
            >
              Escribir una Reseña
            </Button>
          </Box>
        </Container>
      </Box>

      {/* App Download Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ animation: `${fadeIn} 1s ease-out` }}>
              <Typography
                variant="h4"
                component="h2"
                fontWeight="bold"
                gutterBottom
                sx={{ animation: `${slideUp} 0.8s ease-out` }}
              >
                Baja Nuestra App Móvil
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  animation: `${slideUp} 0.8s ease-out 0.2s`,
                  animationFillMode: "both",
                }}
              >
                Descubre los mejores restaurantes, hoteles y lugares de interés
                en República Dominicana desde tu dispositivo móvil. Nuestra
                aplicación te permite:
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Fade
                  in={true}
                  timeout={1000}
                  style={{ transitionDelay: "300ms" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <SearchIcon />
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      Buscar lugares cercanos en tiempo real
                    </Typography>
                  </Box>
                </Fade>
                <Fade
                  in={true}
                  timeout={1000}
                  style={{ transitionDelay: "600ms" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <RateReviewIcon />
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      Escribir y leer reseñas al instante
                    </Typography>
                  </Box>
                </Fade>
                <Fade
                  in={true}
                  timeout={1000}
                  style={{ transitionDelay: "900ms" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <BookmarkIcon />
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      Guardar tus lugares favoritos
                    </Typography>
                  </Box>
                </Fade>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Zoom in={true} style={{ transitionDelay: "1200ms" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShopIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 3,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 10px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    Google Play
                  </Button>
                </Zoom>
                <Zoom in={true} style={{ transitionDelay: "1500ms" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AppleIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      px: 3,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 10px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    App Store
                  </Button>
                </Zoom>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                height: "100%",
              }}
            >
              <Grow in={showMockup} timeout={1000}>
                <Card
                  sx={{
                    width: 280,
                    height: 560,
                    borderRadius: 5,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                    position: "relative",
                    bgcolor: "background.paper",
                    border: "10px solid #333",
                    borderTop: "40px solid #333",
                    borderBottom: "40px solid #333",
                    transition: "transform 0.5s ease, box-shadow 0.5s ease",
                    "&:hover": {
                      transform: "scale(1.02) rotate(1deg)",
                      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
                    },
                    animation: `${pulse} 6s infinite ease-in-out`,
                  }}
                >
                  {/* App Status Bar */}
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      p: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption">9:41</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <WifiIcon
                        fontSize="small"
                        sx={{ animation: `${fadeIn} 1.5s infinite alternate` }}
                      />
                      <BatteryFullIcon fontSize="small" />
                    </Box>
                  </Box>

                  {/* App Header */}
                  <Box
                    sx={{
                      background:
                        "linear-gradient(90deg, #1976d2 0%, #2196f3 50%, #0d47a1 100%)",
                      color: "white",
                      p: 2,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <LocationOnIcon
                      sx={{
                        mr: 1,
                        fontSize: "1.5rem",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { opacity: 0.8 },
                          "50%": { opacity: 1 },
                          "100%": { opacity: 0.8 },
                        },
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: "bold",
                        letterSpacing: ".05rem",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      VecinoApp
                    </Typography>
                  </Box>

                  {/* App Content */}
                  <Box sx={{ p: 2 }}>
                    {/* Search Bar */}
                    <Paper
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1,
                        mb: showMockupSuggestions ? 0 : 2,
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
                        },
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      <SearchIcon
                        color="action"
                        sx={{
                          mr: 1,
                          animation: `${pulse} 2s infinite ease-in-out`,
                        }}
                      />
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          ref={typingRef}
                          sx={{
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            borderRight: "2px solid #777",
                            width:
                              typingIndex === searchText.length
                                ? "100%"
                                : "auto",
                            animation:
                              typingIndex === searchText.length
                                ? `${typing} 3.5s steps(40, end), ${blink} 0.75s step-end infinite`
                                : "none",
                          }}
                        >
                          {searchText.substring(0, typingIndex)}
                        </Typography>
                      </Box>
                    </Paper>

                    {/* Autocomplete Suggestions */}
                    {showMockupSuggestions && (
                      <Paper
                        sx={{
                          mb: 2,
                          borderRadius: "0 0 8px 8px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                          overflow: "hidden",
                          animation: `${slideDown} 0.3s ease-out`,
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {mockupSuggestions.map((suggestion, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 1.5,
                              borderBottom:
                                index < mockupSuggestions.length - 1
                                  ? "1px solid #eee"
                                  : "none",
                              display: "flex",
                              alignItems: "center",
                              transition: "background-color 0.2s",
                              "&:hover": {
                                bgcolor: "rgba(0, 0, 0, 0.04)",
                                cursor: "pointer",
                              },
                              animation: `${fadeIn} 0.3s ease-out ${
                                index * 0.1
                              }s`,
                              opacity: 0,
                              animationFillMode: "forwards",
                            }}
                          >
                            <SearchIcon
                              fontSize="small"
                              sx={{
                                mr: 1,
                                color: "text.secondary",
                                opacity: 0.7,
                              }}
                            />
                            <Typography variant="body2">
                              {suggestion}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    )}

                    {/* Featured Place */}
                    <Typography variant="subtitle2" gutterBottom>
                      Destacados
                    </Typography>
                    <Card
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image="/restaurant1.jpg"
                        alt="Restaurant"
                        sx={{
                          transition: "transform 0.5s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Restaurante El Conuco
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Rating
                            value={4.7}
                            readOnly
                            size="small"
                            precision={0.1}
                            sx={{
                              "& .MuiRating-iconFilled": {
                                animation: `${pulse} 2s infinite ease-in-out`,
                                animationDelay: "calc(var(--mui-index) * 0.1s)",
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            4.7
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Santo Domingo • Comida Dominicana
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Nearby Places */}
                    <Typography variant="subtitle2" gutterBottom>
                      Cerca de ti
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 2,
                        overflow: "auto",
                        "&::-webkit-scrollbar": {
                          height: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "rgba(0,0,0,0.2)",
                          borderRadius: "4px",
                        },
                      }}
                    >
                      <Card
                        sx={{
                          minWidth: 120,
                          borderRadius: 2,
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="80"
                          image="/restaurant2.jpg"
                          alt="Restaurant"
                          sx={{
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="caption" fontWeight="bold">
                            Adrian Tropical
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            4.5 ★
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        sx={{
                          minWidth: 120,
                          borderRadius: 2,
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="80"
                          image="/restaurant3.jpg"
                          alt="Restaurant"
                          sx={{
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="caption" fontWeight="bold">
                            Jalao
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            4.8 ★
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Recent Reviews */}
                    <Typography variant="subtitle2" gutterBottom>
                      Reseñas recientes
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          mb: 1,
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "translateX(3px)",
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1,
                            transition: "transform 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                        />
                        <Box>
                          <Typography variant="caption" fontWeight="bold">
                            María R.
                          </Typography>
                          <Rating value={5} readOnly size="small" />
                          <Typography variant="caption" display="block">
                            ¡Excelente comida y servicio!
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "translateX(3px)",
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            mr: 1,
                            transition: "transform 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                        />
                        <Box>
                          <Typography variant="caption" fontWeight="bold">
                            Juan P.
                          </Typography>
                          <Rating value={4} readOnly size="small" />
                          <Typography variant="caption" display="block">
                            Muy buena experiencia.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* App Navigation */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: "background.paper",
                      borderTop: "1px solid #eee",
                      display: "flex",
                      justifyContent: "space-around",
                      p: 1,
                    }}
                  >
                    <HomeIcon
                      color="primary"
                      sx={{
                        transition: "transform 0.3s ease, color 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                        },
                      }}
                    />
                    <SearchIcon
                      color="action"
                      sx={{
                        transition: "transform 0.3s ease, color 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          color: "primary.main",
                        },
                      }}
                    />
                    <BookmarkIcon
                      color="action"
                      sx={{
                        transition: "transform 0.3s ease, color 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          color: "primary.main",
                        },
                      }}
                    />
                    <PersonIcon
                      color="action"
                      sx={{
                        transition: "transform 0.3s ease, color 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          color: "primary.main",
                        },
                      }}
                    />
                  </Box>
                </Card>
              </Grow>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
}
