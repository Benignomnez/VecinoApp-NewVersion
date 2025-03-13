import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  InputAdornment,
  TextField,
  Button,
  Grid,
  Autocomplete,
  MenuItem,
  Fade,
  Grow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { keyframes } from "@mui/system";

// Define animations
const zoomAnimation = keyframes`
  from {
    transform: scale(1.05);
  }
  to {
    transform: scale(1);
  }
`;

// Location options
const locations = [
  { value: "Santo Domingo", label: "Santo Domingo" },
  { value: "Santiago", label: "Santiago" },
  { value: "Puerto Plata", label: "Puerto Plata" },
  { value: "Punta Cana", label: "Punta Cana" },
  { value: "La Romana", label: "La Romana" },
];

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  location: string;
  setLocation: (location: string) => void;
  handleSearch: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  options: any[];
  loading: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  location,
  setLocation,
  handleSearch,
  handleKeyPress,
  inputValue,
  setInputValue,
  options,
  loading,
  open,
  setOpen,
}) => {
  // Animation states
  const [showContent, setShowContent] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    // Staggered animation timing
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowSearch(true), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "500px", md: "600px" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        mb: 6,
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/place3.jpg")', // Using a better food image
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          animation: `${zoomAnimation} 20s ease-out forwards`,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay for better text contrast
            zIndex: 1,
          },
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 2, textAlign: "center" }}
      >
        {/* Logo and Heading */}
        <Fade in={showContent} timeout={1000}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                color: "white",
                mb: 2,
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                animation: "fadeIn 1.2s ease-out",
              }}
            >
              VecinoApp
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "white",
                mb: 4,
                maxWidth: "800px",
                mx: "auto",
                textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                animation: "fadeIn 1.5s ease-out",
              }}
            >
              Descubre lo mejor de República Dominicana con reseñas reales de la
              comunidad
            </Typography>
          </Box>
        </Fade>

        {/* Search Inputs */}
        <Grow in={showSearch} timeout={800}>
          <Box
            sx={{
              maxWidth: "900px",
              mx: "auto",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transform: "translateY(0)",
              transition: "transform 0.5s ease-out",
            }}
          >
            <Grid container spacing={0}>
              <Grid item xs={12} md={7}>
                <Autocomplete
                  id="search-autocomplete"
                  open={open}
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                  inputValue={inputValue}
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  value={searchQuery}
                  onChange={(event, newValue) => {
                    if (typeof newValue === "string") {
                      setSearchQuery(newValue);
                    } else if (newValue && newValue.description) {
                      setSearchQuery(newValue.description);
                    } else {
                      setSearchQuery("");
                    }
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.place_id === value.place_id
                  }
                  getOptionLabel={(option) => {
                    if (typeof option === "string") {
                      return option;
                    }
                    return option.main_text || option.description || "";
                  }}
                  options={options}
                  loading={loading}
                  filterOptions={(x) => x}
                  freeSolo
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Buscar restaurantes, bares, servicios..."
                      variant="outlined"
                      onKeyPress={handleKeyPress}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                        sx: {
                          bgcolor: "white",
                          borderRadius: {
                            xs: "4px 4px 0 0",
                            md: "4px 0 0 4px",
                          },
                          height: "60px",
                          "& fieldset": { border: "none" },
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {option.main_text}
                        </Typography>
                        {option.secondary_text && (
                          <Typography variant="body2" color="text.secondary">
                            {option.secondary_text}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: "white",
                      borderRadius: { xs: "0", md: "0" },
                      height: "60px",
                      borderLeft: { xs: "none", md: "1px solid #eee" },
                      borderTop: { xs: "1px solid #eee", md: "none" },
                      "& fieldset": { border: "none" },
                    },
                  }}
                >
                  {locations.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  sx={{
                    borderRadius: { xs: "0 0 4px 4px", md: "0 4px 4px 0" },
                    height: "60px",
                    fontSize: "16px",
                    bgcolor: "#ff385c", // Yelp-inspired red color
                    "&:hover": {
                      bgcolor: "#e31c5f",
                    },
                  }}
                >
                  <SearchIcon />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grow>
      </Container>
    </Box>
  );
};

export default HeroSection;
