import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Rating,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Skeleton,
} from "@mui/material";
import { Place, fetchPlacePhotos } from "../api/places";

interface PlaceDetailsProps {
  place: Place;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPhoto = async () => {
      if (place.photos && place.photos.length > 0) {
        try {
          const url = await fetchPlacePhotos(place.photos[0].photoReference);
          setPhotoUrl(url);
        } catch (error) {
          console.error("Failed to load photo:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [place]);

  return (
    <Card data-testid="place-details-card">
      {loading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : photoUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={photoUrl}
          alt={place.name}
          data-testid="place-photo"
        />
      ) : (
        <Box
          sx={{
            height: 200,
            backgroundColor: "grey.300",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No photo available
          </Typography>
        </Box>
      )}

      <CardContent>
        <Typography variant="h5" component="div" data-testid="place-name">
          {place.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1, mt: 1 }}>
          {place.rating && (
            <>
              <Rating
                value={place.rating}
                precision={0.5}
                readOnly
                size="small"
                data-testid="place-rating"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {place.rating}
              </Typography>
            </>
          )}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          data-testid="place-address"
          sx={{ mb: 2 }}
        >
          {place.address}
        </Typography>

        {place.types && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
              {place.types.slice(0, 5).map((type) => (
                <Grid item key={type}>
                  <Chip
                    label={type.replace("_", " ")}
                    size="small"
                    data-testid={`place-type-${type}`}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {place.openingHours && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Opening Hours
            </Typography>
            {place.openingHours.weekdayText.map((day, index) => (
              <Typography
                key={index}
                variant="body2"
                color="text.secondary"
                data-testid={`opening-hours-${index}`}
              >
                {day}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaceDetails;
