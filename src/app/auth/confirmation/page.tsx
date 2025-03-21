"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box, CircularProgress, Typography, Container } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";

// This page serves as a visual while email confirmation is being processed
export default function ConfirmationPage() {
  const searchParams = useSearchParams();

  // This is just a visual component as the actual redirection is handled in route.ts
  // This page will show briefly while the server confirms the token
  return (
    <MainLayout>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h5" align="center" gutterBottom>
            Verificando tu cuenta...
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            Por favor espera mientras confirmamos tu correo electrónico. Serás
            redirigido automáticamente.
          </Typography>
        </Box>
      </Container>
    </MainLayout>
  );
}
