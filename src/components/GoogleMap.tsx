"use client";

import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markerTitle?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  lat,
  lng,
  zoom = 15,
  markerTitle = "Location",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Function to initialize the map
    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        const mapOptions = {
          center: { lat, lng },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        // Create the map
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions
        );

        // Add a marker
        new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: markerTitle,
          animation: window.google.maps.Animation.DROP,
        });
      }
    };

    // Function to load the Google Maps API
    const loadGoogleMapsAPI = () => {
      if (!apiKey) {
        console.error("Google Maps API key is missing");
        return;
      }

      // Check if the API is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Define the callback function
      window.initMap = initializeMap;

      // Create the script element
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return () => {
        // Clean up
        window.initMap = () => {};
        document.head.removeChild(script);
      };
    };

    loadGoogleMapsAPI();
  }, [lat, lng, zoom, markerTitle, apiKey]);

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });

      // Update marker position
      const markers = mapInstanceRef.current.markers || [];
      if (markers.length > 0) {
        markers[0].setPosition({ lat, lng });
      } else {
        // Create a new marker if none exists
        new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: markerTitle,
        });
      }
    }
  }, [lat, lng, markerTitle]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: "100%",
        height: "300px",
        borderRadius: 2,
        overflow: "hidden",
      }}
    />
  );
};

export default GoogleMap;
