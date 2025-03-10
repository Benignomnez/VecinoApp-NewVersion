import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Facebook, Twitter, Instagram } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "white",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                letterSpacing: ".05rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LocationOnIcon sx={{ mr: 1 }} />
              VecinoApp
            </Typography>
            <Typography variant="body2">
              La plataforma líder para descubrir y reseñar negocios locales en
              tu vecindario.
            </Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Enlaces
            </Typography>
            <Box component="ul" sx={{ p: 0, listStyle: "none" }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/" color="inherit" underline="hover">
                  Inicio
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link
                  href="/places?type=restaurant"
                  color="inherit"
                  underline="hover"
                >
                  Restaurantes
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link
                  href="/places?type=service"
                  color="inherit"
                  underline="hover"
                >
                  Servicios
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link
                  href="/places?type=entertainment"
                  color="inherit"
                  underline="hover"
                >
                  Entretenimiento
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/write-review" color="inherit" underline="hover">
                  Escribir Reseña
                </Link>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Información
            </Typography>
            <Box component="ul" sx={{ p: 0, listStyle: "none" }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/about" color="inherit" underline="hover">
                  Acerca de Nosotros
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/contact" color="inherit" underline="hover">
                  Contacto
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/terms" color="inherit" underline="hover">
                  Términos de Servicio
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/privacy" color="inherit" underline="hover">
                  Política de Privacidad
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/faq" color="inherit" underline="hover">
                  Preguntas Frecuentes
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 3,
            textAlign: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            pt: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} VecinoApp. Todos los derechos
            reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
