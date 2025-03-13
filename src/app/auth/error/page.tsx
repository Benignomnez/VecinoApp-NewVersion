"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MainLayout from "@/components/layout/MainLayout";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>(
    "Ha ocurrido un error durante la autenticación."
  );

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorType(error);

      // Set specific error messages based on error type
      if (error === "confirmationFailed") {
        setErrorMessage(
          "No pudimos confirmar tu correo electrónico. El enlace puede haber expirado o ya ha sido utilizado."
        );
      } else if (error === "sessionExpired") {
        setErrorMessage(
          "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
        );
      } else if (error === "unauthorized") {
        setErrorMessage("No tienes permiso para acceder a este recurso.");
      }
    }
  }, [searchParams]);

  const handleReturnToLogin = () => {
    router.push("/auth?mode=login");
  };

  const handleReturnToHome = () => {
    router.push("/");
  };

  return (
    <MainLayout>
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            mt: 8,
            mb: 4,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <ErrorOutlineIcon color="error" sx={{ fontSize: 64, mb: 2 }} />

          <Typography variant="h5" component="h1" gutterBottom align="center">
            Error de Autenticación
          </Typography>

          <Alert severity="error" sx={{ mt: 2, mb: 4, width: "100%" }}>
            {errorMessage}
          </Alert>

          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={handleReturnToHome}>
              Ir al Inicio
            </Button>
            <Button variant="contained" onClick={handleReturnToLogin}>
              Volver a Iniciar Sesión
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
