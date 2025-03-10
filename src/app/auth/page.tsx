"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
} from "@mui/icons-material";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    authState,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
  } = useAuth();

  // Set active tab based on URL parameter
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "login") {
      setActiveTab("login");
    } else if (mode === "register") {
      setActiveTab("register");
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.user) {
      router.push("/");
    }
  }, [authState.user, router]);

  const handleTabChange = (tab: "register" | "login") => {
    setActiveTab(tab);
    router.push(`/auth?mode=${tab}`);
  };

  const validateForm = () => {
    setError(null);

    if (activeTab === "register") {
      if (!fullName.trim()) {
        setError("Por favor ingresa tu nombre completo");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }
      if (!agreeTerms) {
        setError("Debes aceptar los términos y condiciones");
        return false;
      }
    }

    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return false;
    }

    if (!password) {
      setError("Por favor ingresa tu contraseña");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || "Error al iniciar sesión");
        } else {
          router.push("/");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message || "Error al crear la cuenta");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Facebook");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Apple");
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="sm">
        <Box
          sx={{
            maxWidth: 500,
            margin: "50px auto",
            padding: 4,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Tabs */}
          <Box sx={{ display: "flex", mb: 3 }}>
            <Box
              sx={{
                flex: 1,
                textAlign: "center",
                padding: 2,
                cursor: "pointer",
                borderBottom:
                  activeTab === "register" ? "2px solid" : "2px solid #ddd",
                borderColor:
                  activeTab === "register" ? "primary.main" : undefined,
                color:
                  activeTab === "register" ? "primary.main" : "text.secondary",
                fontWeight: 500,
                transition: "all 0.3s",
              }}
              onClick={() => handleTabChange("register")}
            >
              Crear Cuenta
            </Box>
            <Box
              sx={{
                flex: 1,
                textAlign: "center",
                padding: 2,
                cursor: "pointer",
                borderBottom:
                  activeTab === "login" ? "2px solid" : "2px solid #ddd",
                borderColor: activeTab === "login" ? "primary.main" : undefined,
                color:
                  activeTab === "login" ? "primary.main" : "text.secondary",
                fontWeight: 500,
                transition: "all 0.3s",
              }}
              onClick={() => handleTabChange("login")}
            >
              Iniciar Sesión
            </Box>
          </Box>

          {/* Register Tab Content */}
          {activeTab === "register" && (
            <>
              <Typography variant="h5" align="center" gutterBottom>
                Únete a la comunidad VecinoApp
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                sx={{
                  mb: 2,
                  bgcolor: "#4285F4",
                  "&:hover": { bgcolor: "#3367D6" },
                }}
              >
                Continuar con Google
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AppleIcon />}
                onClick={handleAppleSignIn}
                sx={{ mb: 2, bgcolor: "#000", "&:hover": { bgcolor: "#333" } }}
              >
                Continuar con Apple
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FacebookIcon />}
                onClick={handleFacebookSignIn}
                sx={{
                  mb: 3,
                  bgcolor: "#3b5998",
                  "&:hover": { bgcolor: "#2d4373" },
                }}
              >
                Continuar con Facebook
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2 }}
                >
                  o con email
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="Mínimo 8 caracteres, incluyendo una letra mayúscula y un número"
                />
                <TextField
                  fullWidth
                  label="Confirmar contraseña"
                  type="password"
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Acepto los{" "}
                      <Link href="/terms" style={{ color: "primary.main" }}>
                        Términos de Servicio
                      </Link>{" "}
                      y la{" "}
                      <Link href="/privacy" style={{ color: "primary.main" }}>
                        Política de Privacidad
                      </Link>
                    </Typography>
                  }
                  sx={{ mt: 2 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Crear Cuenta"}
                </Button>
              </Box>
            </>
          )}

          {/* Login Tab Content */}
          {activeTab === "login" && (
            <>
              <Typography variant="h5" align="center" gutterBottom>
                Bienvenido de nuevo
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                sx={{
                  mb: 2,
                  bgcolor: "#4285F4",
                  "&:hover": { bgcolor: "#3367D6" },
                }}
              >
                Continuar con Google
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AppleIcon />}
                onClick={handleAppleSignIn}
                sx={{ mb: 2, bgcolor: "#000", "&:hover": { bgcolor: "#333" } }}
              >
                Continuar con Apple
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FacebookIcon />}
                onClick={handleFacebookSignIn}
                sx={{
                  mb: 3,
                  bgcolor: "#3b5998",
                  "&:hover": { bgcolor: "#2d4373" },
                }}
              >
                Continuar con Facebook
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2 }}
                >
                  o con email
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <Link
                    href="/auth/forgot-password"
                    style={{ color: "primary.main" }}
                  >
                    <Typography variant="body2">
                      ¿Olvidaste tu contraseña?
                    </Typography>
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Iniciar Sesión"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
