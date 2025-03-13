import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Paper,
  InputAdornment,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { searchPlaces, Place } from "../api/places";

interface PlaceSearchProps {
  onSearchResults: (places: Place[]) => void;
  defaultLocation?: string;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({
  onSearchResults,
  defaultLocation = "Santo Domingo, Dominican Republic",
}) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchPlaces(query, location);
      onSearchResults(results);
    } catch (err) {
      setError("Failed to search places. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }} data-testid="place-search-form">
      <Typography variant="h6" gutterBottom>
        Find Places in Dominican Republic
      </Typography>

      <Box component="form" onSubmit={handleSearch} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Restaurants, hotels, attractions..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              data-testid="search-query-input"
              error={!!error && !query.trim()}
              helperText={error && !query.trim() ? error : ""}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="City, neighborhood..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
              data-testid="search-location-input"
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              data-testid="search-button"
              sx={{ mt: { xs: 0, md: 2 }, height: 56 }}
            >
              {loading ? <CircularProgress size={24} /> : "Search"}
            </Button>
          </Grid>
        </Grid>

        {error && query.trim() && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mt: 2 }}
            data-testid="search-error"
          >
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default PlaceSearch;
