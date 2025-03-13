import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Footer from "./Footer";
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { keyframes } from "@mui/system";
import Image from "next/image";
import Logo from "@/components/Logo";
import TrendingPlaces from "@/components/TrendingPlaces";

const pages = [
  { name: "Inicio", path: "/" },
  { name: "Restaurantes", path: "/places?type=restaurant" },
  { name: "Servicios", path: "/places?type=service" },
  { name: "Entretenimiento", path: "/places?type=entertainment" },
  { name: "Escribir Reseña", path: "/write-review" },
];

// Add standalone navigation functions for reliability
const navigateToLogin = () => {
  window.location.href = "/auth?mode=login";
};

const navigateToRegister = () => {
  window.location.href = "/auth?mode=register";
};

// Define animations
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { authState, signOut } = useAuth();
  const router = useRouter();
  const [sessionStable, setSessionStable] = useState(false);
  const [showFallbackButtons, setShowFallbackButtons] = useState(false);

  useEffect(() => {
    if (!authState.isLoading) {
      setSessionStable(true);
      setShowFallbackButtons(false);
    }
  }, [authState.isLoading, authState.user]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (authState.isLoading) {
        setShowFallbackButtons(true);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [authState.isLoading]);

  useEffect(() => {
    if (authState.error) {
      setShowFallbackButtons(true);
    }
  }, [authState.error]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleCloseUserMenu();
    router.push("/");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #ff385c 0%, #e31c5f 100%)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                mr: 2,
              }}
            >
              <Logo variant="default" color="white" />
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.name}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={page.path}
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Typography textAlign="center">{page.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "flex", md: "none" },
                justifyContent: "center",
              }}
            >
              <Logo variant="small" color="white" />
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              {pages.map((page) => (
                <Button
                  key={page.name}
                  component={Link}
                  href={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    mx: 1,
                    color: "white",
                    display: "block",
                    fontWeight: 500,
                    position: "relative",
                    padding: "6px 16px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      transform: "translateY(-2px)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "0%",
                      height: "2px",
                      bottom: "0",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "white",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "70%",
                    },
                  }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            {sessionStable && authState.user ? (
              <>
                <Tooltip title="Abrir opciones">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={authState.user.full_name || "Usuario"}
                      src={
                        authState.user.avatar_url
                          ? authState.user.avatar_url.replace(
                              "/avatars/",
                              "/profiles/"
                            )
                          : "/default-avatar.png"
                      }
                      sx={{
                        width: 40,
                        height: 40,
                        border: "2px solid rgba(255, 255, 255, 0.7)",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{
                    mt: "45px",
                    "& .MuiPaper-root": {
                      borderRadius: "10px",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      router.push("/profile");
                    }}
                  >
                    <Typography textAlign="center">Mi Perfil</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <Typography textAlign="center">Cerrar Sesión</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : authState.isLoading && !showFallbackButtons ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={navigateToLogin}
                  sx={{
                    color: "white",
                    borderColor: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="contained"
                  onClick={navigateToRegister}
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  Registrarse
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default MainLayout;
