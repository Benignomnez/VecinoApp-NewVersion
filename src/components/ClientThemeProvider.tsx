"use client";

import React, { useEffect, useState } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/styles/theme";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";
import { initializeStorage, checkSupabaseHealth } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connectionChecked, setConnectionChecked] = useState(false);

  // Initialize Supabase storage and check connection health on first client render
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check Supabase health
        const health = await checkSupabaseHealth();
        if (!health.healthy) {
          console.error("Supabase connection issue:", health.error);
          toast.error(
            "Error de conexión con el servidor. Por favor, intenta más tarde."
          );
        } else {
          console.log(
            `Supabase connection healthy, response time: ${health.responseTime}ms`
          );
        }
        setConnectionChecked(true);

        // Use a flag to prevent repeated initialization attempts
        const storageInitialized = localStorage.getItem(
          "supabaseStorageInitialized"
        );

        if (!storageInitialized) {
          // Initialize storage buckets
          initializeStorage()
            .then(() => {
              localStorage.setItem("supabaseStorageInitialized", "true");
              console.log("Storage initialization complete");
            })
            .catch((err) => {
              console.error("Failed to initialize storage:", err);
            });
        }
      } catch (error) {
        console.error("Error during app initialization:", error);
        setConnectionChecked(true);
        toast.error(
          "Error al inicializar la aplicación. Por favor, recarga la página."
        );
      }
    };

    // Start initialization with a slight delay to avoid blocking first render
    const initTimer = setTimeout(() => {
      initializeApp();
    }, 500);

    return () => clearTimeout(initTimer);
  }, []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            success: {
              style: {
                background: "#4caf50",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#e53935",
                color: "white",
              },
            },
            loading: {
              style: {
                background: "#2196f3",
                color: "white",
              },
            },
          }}
        />
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
