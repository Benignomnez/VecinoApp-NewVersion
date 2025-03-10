"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { authState, updateProfile, signOut } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(authState.user?.full_name || "");
  const [bio, setBio] = useState(authState.user?.bio || "");
  const [location, setLocation] = useState(authState.user?.location || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!authState.user && !authState.isLoading) {
    router.push("/auth?mode=login");
    return null;
  }

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
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await updateProfile({
        full_name: fullName,
        bio,
        location,
      });

      if (error) {
        setError(error.message || "Error al actualizar el perfil");
      } else {
        setSuccess("Perfil actualizado con éxito");
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      // In a real app, you would delete the user's account
      // For now, just sign out
      await signOut();
      router.push("/");
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración de la Cuenta
        </Typography>

        <Card
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Perfil
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleUpdateProfile}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  src={authState.user?.avatar_url || "/default-avatar.png"}
                  alt={authState.user?.full_name}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Foto de Perfil
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    La foto de perfil se obtiene de tu proveedor de
                    autenticación.
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Nombre Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Biografía"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="Cuéntanos un poco sobre ti..."
              />

              <TextField
                fullWidth
                label="Ubicación"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                margin="normal"
                placeholder="Ej. Santo Domingo, República Dominicana"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Guardar Cambios"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cuenta
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Correo Electrónico
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {authState.session?.user.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" color="error" gutterBottom>
              Zona de Peligro
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor,
              asegúrate de que esto es lo que quieres.
            </Typography>

            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteAccount}
            >
              Eliminar Cuenta
            </Button>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
}
