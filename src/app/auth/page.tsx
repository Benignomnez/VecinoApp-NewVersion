"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { authState, signIn, signUp } = useAuth();

  // Restablecer el estado de carga cuando se carga la página
  useEffect(() => {
    setLoading(false);
    console.log("Componente AuthPage montado, estado de carga restablecido");
  }, []);

  // Add a direct timeout to reset loading state if it gets stuck
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log("⚠️ Safety timeout: Forcing loading state to false");
        setLoading(false);
      }, 8000); // 8 second safety timeout

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Set active tab based on URL parameter
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "login") {
      setActiveTab("login");
    } else if (mode === "register") {
      setActiveTab("register");
    }
  }, [searchParams]);

  // Redirect if already authenticated - modified to be more selective
  useEffect(() => {
    // Add a small delay to let the page fully load before checking auth
    const timer = setTimeout(() => {
      // Check if we have either a session OR a user - we want to be more permissive with redirection
      if (authState.session || authState.user) {
        console.log(
          "Usuario autenticado (session o user), redirigiendo a la página principal"
        );
        // Force redirection with a direct approach
        forceRedirectToHome();
      } else {
        console.log(
          "No hay sesión ni usuario, permaneciendo en la página de autenticación"
        );
      }
    }, 300); // Small delay to ensure page is fully loaded

    return () => clearTimeout(timer);
  }, [authState.user, authState.session]);

  // Sincronizar el estado de carga local con el estado global
  useEffect(() => {
    if (authState.isLoading === false) {
      setLoading(false);
    }
  }, [authState.isLoading]);

  // Mostrar errores del estado de autenticación
  useEffect(() => {
    if (authState.error) {
      setError(authState.error);
      setLoading(false);
    }
  }, [authState.error]);

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    // Clear form data when component mounts
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setAgreeTerms(false);

    // Return cleanup function to clear data when component unmounts
    return () => {
      setEmail("");
      setPassword("");
      setFullName("");
      setConfirmPassword("");
      setAgreeTerms(false);
      setError(null);
      setPasswordError(null);
      setConfirmPasswordError(null);
    };
  }, []);

  // Check if user came from email confirmation
  useEffect(() => {
    const emailConfirmed = searchParams.get("emailConfirmed");
    if (emailConfirmed === "true" && authState.session) {
      console.log("Email confirmado, redirigiendo a home");
      forceRedirectToHome(true);
    }
  }, [searchParams, authState.session]);

  const handleTabChange = (tab: "register" | "login") => {
    setActiveTab(tab);
    // Clear form fields and errors when switching tabs
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
    setAgreeTerms(false);
    setError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    // Use direct URL navigation instead of router.push
    console.log(`Changing tab to ${tab} using direct URL navigation`);
    window.location.href = `/auth?mode=${tab}`;
  };

  const validateForm = () => {
    setError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    if (activeTab === "register") {
      if (!fullName.trim()) {
        setError("Por favor ingresa tu nombre completo");
        return false;
      }

      // Validación de contraseña
      if (password.length < 8) {
        setPasswordError("La contraseña debe tener al menos 8 caracteres");
        return false;
      }

      if (!/(?=.*[a-z])/.test(password)) {
        setPasswordError(
          "La contraseña debe incluir al menos una letra minúscula"
        );
        return false;
      }

      if (!/(?=.*[A-Z])/.test(password)) {
        setPasswordError(
          "La contraseña debe incluir al menos una letra mayúscula"
        );
        return false;
      }

      if (!/(?=.*\d)/.test(password)) {
        setPasswordError("La contraseña debe incluir al menos un número");
        return false;
      }

      if (password !== confirmPassword) {
        setConfirmPasswordError("Las contraseñas no coinciden");
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
      setPasswordError("Por favor ingresa tu contraseña");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Formulario validado, iniciando proceso de autenticación");
    setLoading(true);
    setError(null);

    try {
      if (activeTab === "login") {
        console.log("Iniciando sesión con email:", email);
        const { error } = await signIn(email, password);
        if (error) {
          console.error("Error al iniciar sesión:", error);
          setError(error.message || "Error al iniciar sesión");
          setLoading(false);
        } else {
          console.log("Inicio de sesión exitoso, redirigiendo...");
          // Force direct redirection - pass true to force redirect even on auth page
          forceRedirectToHome(true);
        }
      } else {
        console.log("Creando cuenta con email:", email, "y nombre:", fullName);
        const { error, user } = await signUp(email, password, fullName);
        if (error) {
          console.error("Error al crear la cuenta:", error);
          setError(error.message || "Error al crear la cuenta");
          setLoading(false);
        } else {
          console.log("Cuenta creada exitosamente");

          // Clear form after successful registration
          setFullName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setAgreeTerms(false);
          setLoading(false);

          // Show a message to check email
          // Toast already handled in useAuth hook
        }
      }
    } catch (err: any) {
      console.error("Error inesperado en autenticación:", err);
      setError(err.message || "Ocurrió un error inesperado");
      setLoading(false);
    } finally {
      // Safety timeout
      setTimeout(() => {
        if (authState.session) {
          console.log(
            "⏱️ Safety timeout: Found active session, forcing redirection"
          );
          forceRedirectToHome(true);
        } else {
          console.log(
            "⏱️ Safety timeout: No active session found, only resetting loading state"
          );
        }
        setLoading(false);
      }, 5000);
    }
  };

  // Verificar si el formulario es válido para habilitar/deshabilitar el botón
  const isFormValid = () => {
    if (activeTab === "register") {
      return (
        fullName.trim() !== "" &&
        email.trim() !== "" &&
        password.length >= 8 &&
        /(?=.*[a-z])/.test(password) &&
        /(?=.*[A-Z])/.test(password) &&
        /(?=.*\d)/.test(password) &&
        password === confirmPassword &&
        agreeTerms
      );
    } else {
      return email.trim() !== "" && password.trim() !== "";
    }
  };

  // Validación en tiempo real para la contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (activeTab === "register") {
      if (newPassword.length > 0 && newPassword.length < 8) {
        setPasswordError("La contraseña debe tener al menos 8 caracteres");
      } else if (newPassword.length >= 8 && !/(?=.*[a-z])/.test(newPassword)) {
        setPasswordError(
          "La contraseña debe incluir al menos una letra minúscula"
        );
      } else if (newPassword.length >= 8 && !/(?=.*[A-Z])/.test(newPassword)) {
        setPasswordError(
          "La contraseña debe incluir al menos una letra mayúscula"
        );
      } else if (newPassword.length >= 8 && !/(?=.*\d)/.test(newPassword)) {
        setPasswordError("La contraseña debe incluir al menos un número");
      } else {
        setPasswordError(null);
      }

      // Verificar coincidencia con confirmPassword si ya se ha ingresado
      if (confirmPassword && newPassword !== confirmPassword) {
        setConfirmPasswordError("Las contraseñas no coinciden");
      } else if (confirmPassword) {
        setConfirmPasswordError(null);
      }
    }
  };

  // Validación en tiempo real para confirmar contraseña
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Las contraseñas no coinciden");
    } else {
      setConfirmPasswordError(null);
    }
  };

  // Add a direct redirection function
  const forceRedirectToHome = (forceRedirectEvenOnAuthPage = false) => {
    // Debug info to help understand the redirection
    console.log("🔄 FORCING REDIRECTION TO HOME PAGE");
    console.log("Current auth state:", {
      hasUser: !!authState.user,
      hasSession: !!authState.session,
      isLoading: authState.isLoading,
      hasError: !!authState.error,
      forceRedirectEvenOnAuthPage,
    });

    // Skip redirection while we're at the auth page explicitly - only if not forced
    if (
      !forceRedirectEvenOnAuthPage &&
      window.location.pathname.includes("/auth")
    ) {
      const mode = searchParams.get("mode");
      // Only redirect if we're not trying to login/register
      if (mode === "login" || mode === "register") {
        console.log(
          "🚫 Skipping automatic redirect because we're on auth page with mode:",
          mode
        );
        return;
      }
    }

    // Otherwise proceed with redirection
    console.log("🔄 REDIRECTING NOW...");
    setTimeout(() => {
      window.location.replace("/");
    }, 100);
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

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                sx={{ mt: 2 }}
              >
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  margin="normal"
                  disabled={loading}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error && error.includes("correo")}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={loading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  disabled={loading}
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
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Procesando...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
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

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                sx={{ mt: 2 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error && error.includes("correo")}
                  disabled={loading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={loading}
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
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Procesando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </MainLayout>
  );
}
