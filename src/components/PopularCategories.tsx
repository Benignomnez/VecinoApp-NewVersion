import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Chip,
} from "@mui/material";
import { keyframes } from "@mui/system";
import Link from "next/link";

// Define animation for the categories
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface Category {
  id: string;
  name: string;
  type: string;
  count: number;
  photo?: string;
}

// Categories with their corresponding Google Places API types
const CATEGORIES = [
  { id: "restaurant", name: "Restaurantes", type: "restaurant" },
  { id: "cafe", name: "Cafeterías", type: "cafe" },
  { id: "bar", name: "Bares", type: "bar" },
  { id: "hotel", name: "Hoteles", type: "lodging" },
  { id: "shopping", name: "Compras", type: "shopping_mall" },
  { id: "entertainment", name: "Entretenimiento", type: "movie_theater" },
  { id: "spa", name: "Spa & Belleza", type: "spa" },
  { id: "gym", name: "Gimnasios", type: "gym" },
];

const PopularCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);

        // Fetch data for each category
        const categoriesWithData = await Promise.all(
          CATEGORIES.map(async (category) => {
            try {
              // Fetch places for this category type
              const response = await fetch(
                `/api/places/search?location=Santo Domingo&type=${category.type}`
              );

              if (!response.ok) {
                throw new Error(`Failed to fetch ${category.name}`);
              }

              const data = await response.json();

              // Get a photo from the first result if available
              let photo = "";
              if (
                data.results &&
                data.results.length > 0 &&
                data.results[0].photos &&
                data.results[0].photos.length > 0
              ) {
                photo = `/api/places/photo?photoReference=${data.results[0].photos[0].photo_reference}&maxWidth=400&cache=true`;
              }

              return {
                ...category,
                count: data.results ? data.results.length : 0,
                photo,
              };
            } catch (err) {
              console.error(`Error fetching ${category.name}:`, err);
              return {
                ...category,
                count: 0,
                photo: "",
              };
            }
          })
        );

        setCategories(categoriesWithData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Could not load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Categorías Populares
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={140}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Categorías Populares
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Categorías Populares
      </Typography>
      <Grid container spacing={2}>
        {categories.map((category, index) => (
          <Grid item xs={6} sm={4} md={3} key={category.id}>
            <Card
              component={Link}
              href={`/places?type=${category.type}`}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                animation: `${fadeIn} 0.5s ease-out ${index * 0.1}s both`,
                textDecoration: "none",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={category.photo || `/images/${category.id}.jpg`}
                alt={category.name}
                sx={{
                  objectFit: "cover",
                }}
              />
              <CardContent sx={{ flexGrow: 1, bgcolor: "white" }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 600 }}
                >
                  {category.name}
                </Typography>
                <Chip
                  label={`${category.count} lugares`}
                  size="small"
                  sx={{
                    bgcolor: "primary.light",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PopularCategories;
