"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { AuthState, User } from "@/types";
import toast from "react-hot-toast";

// Create a context for authentication
const AuthContext = createContext<{
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any; user: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
}>({
  authState: { user: null, session: null, isLoading: false, error: null },
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
});

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: false,
    error: null,
  });

  // Función para actualizar el estado de autenticación de manera segura
  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  };

  // Add a safety timeout function to prevent infinite loading states
  const resetLoadingWithTimeout = (timeoutMs = 10000) => {
    const timer = setTimeout(() => {
      console.log(
        "⚠️ Auth safety timeout triggered: Forcing loading state to false"
      );
      updateAuthState({ isLoading: false });
    }, timeoutMs);
    return timer;
  };

  useEffect(() => {
    // Track if authentication is in progress to avoid timeout conflicts
    let authInProgress = false;

    // Reference to store the global timeout so we can clear it
    let globalSafetyTimer: NodeJS.Timeout | null = null;

    // Only start the global safety timeout if we're automatically checking auth,
    // not when the user is actively logging in
    const startGlobalSafetyTimeout = () => {
      // Clear any existing timeout first
      if (globalSafetyTimer) {
        clearTimeout(globalSafetyTimer);
      }

      // Set a new timeout only if not in the middle of an auth operation
      if (!authInProgress) {
        globalSafetyTimer = setTimeout(() => {
          console.log("🚨 GLOBAL AUTH TIMEOUT: Forcing state reset");
          updateAuthState({
            isLoading: false,
            error: "Authentication timed out. Please try refreshing the page.",
          });
        }, 30000); // Extend to 30 seconds (was 15 seconds)
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Verificando sesión inicial...");
        updateAuthState({ isLoading: true });

        // Start the global safety timer
        startGlobalSafetyTimeout();

        // Add retry mechanism for session retrieval
        let retries = 0;
        const maxRetries = 3;
        let session = null;
        let error = null;

        while (retries < maxRetries && !session) {
          try {
            console.log(`Intento ${retries + 1} de obtener sesión...`);
            const response = await supabase.auth.getSession();
            session = response.data.session;
            if (!session) {
              console.log(`No hay sesión en intento ${retries + 1}`);
              if (retries < maxRetries - 1) {
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * (retries + 1))
                );
              }
            }
          } catch (err) {
            console.error(`Error en intento ${retries + 1}:`, err);
            error = err;
            if (retries < maxRetries - 1) {
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * (retries + 1))
              );
            }
          }
          retries++;
        }

        // Safety timeout to prevent infinite loading
        const safetyTimer = setTimeout(() => {
          console.log("⚠️ Initial session safety timeout triggered");
          updateAuthState({ isLoading: false });
        }, 5000);

        if (error && !session) {
          throw error;
        }

        // Clear safety timeout
        clearTimeout(safetyTimer);

        if (session) {
          console.log("Sesión encontrada, cargando perfil...");

          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.warn(
              "Error fetching profile, trying to create one:",
              profileError
            );

            // If profile doesn't exist, create a basic one based on user data
            const userData = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || "Usuario",
              email: session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .upsert(userData)
              .select()
              .single();

            if (createError) {
              console.error("Failed to create profile:", createError);
              updateAuthState({
                user: userData, // Use the basic user data we attempted to insert
                session,
                isLoading: false,
                error: "Profile creation failed but proceeding with session",
              });
            } else {
              console.log("Created new profile:", newProfile);
              updateAuthState({
                user: newProfile,
                session,
                isLoading: false,
                error: null,
              });
            }
          } else {
            updateAuthState({
              user: profile,
              session,
              isLoading: false,
              error: null,
            });
            console.log("Perfil cargado:", profile);
          }
        } else {
          console.log("No hay sesión activa");
          updateAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        updateAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: "Failed to get initial session",
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "Auth state changed:",
        event,
        session ? "Session exists" : "No session"
      );

      // Store the last auth event to prevent duplicate processing
      const lastEventKey = "lastAuthEvent";
      const currentEventData = `${event}-${
        session?.user?.id || "none"
      }-${Date.now()}`;
      const lastEventData = localStorage.getItem(lastEventKey);

      // If this is the same event we just processed (within 2 seconds), ignore it
      if (
        lastEventData &&
        lastEventData.startsWith(`${event}-${session?.user?.id || "none"}`) &&
        Date.now() - parseInt(lastEventData.split("-")[2]) < 2000
      ) {
        console.log("Ignoring duplicate auth event");
        return;
      }

      // Store this event
      localStorage.setItem(lastEventKey, currentEventData);

      if (session) {
        console.log("Session data:", {
          userId: session.user?.id,
          email: session.user?.email,
          accessToken: session.access_token ? "Exists" : "Missing",
        });

        // Handle sign in without immediate redirect
        if (event === "SIGNED_IN" && typeof window !== "undefined") {
          console.log("🔄 Auth state detected sign in");

          // Skip redirection if we're on the auth page
          const isAuthPage = window.location.pathname.includes("/auth");

          // Only redirect from auth page to home, not from other pages
          if (isAuthPage) {
            console.log("We're on the auth page, redirecting to home");
            window.location.href = "/";
            return; // Exit early to prevent profile loading until redirect completes
          }
        }

        updateAuthState({ isLoading: true });

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        updateAuthState({
          user: profile || null,
          session,
          isLoading: false,
          error: null,
        });

        console.log(
          "Auth state updated with user profile:",
          profile ? "found" : "not found"
        );
      } else {
        updateAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: null,
        });
      }
    });

    // Clear the global safety timer on cleanup
    return () => {
      if (globalSafetyTimer) {
        clearTimeout(globalSafetyTimer);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Iniciando sesión...");

      updateAuthState({
        isLoading: true,
        error: null,
      });

      // Set a dedicated timeout just for this sign-in operation
      const signInTimer = setTimeout(() => {
        console.log("⚠️ Sign in operation timed out");
        updateAuthState({
          isLoading: false,
          error:
            "La operación de inicio de sesión tomó demasiado tiempo. Por favor, intente de nuevo.",
        });
        toast.dismiss(loadingToast);
        toast.error("Tiempo de espera agotado. Por favor, intente de nuevo.");
      }, 20000); // 20 seconds should be plenty for a login operation

      console.log("Attempting to sign in with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Clear the sign-in timeout
      clearTimeout(signInTimer);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (error) {
        console.error("Sign in error:", error);
        updateAuthState({
          error: error.message,
          isLoading: false,
        });

        // Show error toast
        toast.error(error.message || "Error al iniciar sesión");

        return { error };
      }

      console.log("Sign in successful, user:", data.user?.id);

      // Show success toast
      toast.success("¡Bienvenido de nuevo!");

      // Explicitly update session state first for faster UI response
      if (data.session) {
        console.log("Updating auth state with session token");
        updateAuthState({
          session: data.session,
        });
      }

      // Obtener el perfil del usuario después de iniciar sesión
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        console.log("User profile loaded:", profile ? "yes" : "no");
        updateAuthState({
          user: profile || null,
          session: data.session,
          isLoading: false,
          error: null,
        });

        // Signal that redirection should happen immediately after successful login
        console.log("Authentication complete - ready for redirection");
      } else {
        // Si no hay usuario, asegurarse de restablecer el estado de carga
        updateAuthState({
          isLoading: false,
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error in signIn:", error);
      updateAuthState({
        error: error.message,
        isLoading: false,
      });

      // Show error toast
      toast.error("Error inesperado. Por favor, intente de nuevo.");

      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Validar la contraseña
      if (password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres");
        return {
          error: { message: "La contraseña debe tener al menos 8 caracteres" },
          user: null,
        };
      }

      if (!/(?=.*[a-z])/.test(password)) {
        toast.error("La contraseña debe incluir al menos una letra minúscula");
        return {
          error: {
            message: "La contraseña debe incluir al menos una letra minúscula",
          },
          user: null,
        };
      }

      if (!/(?=.*[A-Z])/.test(password)) {
        toast.error("La contraseña debe incluir al menos una letra mayúscula");
        return {
          error: {
            message: "La contraseña debe incluir al menos una letra mayúscula",
          },
          user: null,
        };
      }

      if (!/(?=.*\d)/.test(password)) {
        toast.error("La contraseña debe incluir al menos un número");
        return {
          error: { message: "La contraseña debe incluir al menos un número" },
          user: null,
        };
      }

      // Show loading toast
      const loadingToast = toast.loading("Creando tu cuenta...");

      console.log("Iniciando proceso de registro...");
      updateAuthState({
        isLoading: true,
        error: null,
      });

      // Set a dedicated timeout for this signup operation
      const signUpTimer = setTimeout(() => {
        console.log("⚠️ Sign up operation timed out");
        updateAuthState({
          isLoading: false,
          error:
            "El registro está tomando más tiempo de lo esperado. Por favor, intente de nuevo.",
        });
        toast.dismiss(loadingToast);
        toast.error("Tiempo de espera agotado. Por favor, intente de nuevo.");
      }, 30000); // 30 seconds for signup which requires more operations

      console.log("Llamando a supabase.auth.signUp...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      // Clear the signup timeout
      clearTimeout(signUpTimer);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (error) {
        console.error("Error en signUp:", error);
        updateAuthState({
          error: error.message,
          isLoading: false,
        });

        // Show error toast
        toast.error(error.message || "Error al crear la cuenta");

        return { error, user: null };
      }

      console.log("Respuesta de signUp:", data);

      // Show confirmation message for email verification
      toast.success(
        "¡Registro exitoso! Por favor, verifica tu correo electrónico para confirmar tu cuenta.",
        { duration: 6000 }
      );

      // Explicitly update session state first for faster UI response
      if (data.session) {
        updateAuthState({
          session: data.session,
        });
      }

      // Create profile in profiles table
      if (data.user) {
        try {
          console.log(
            "User created, now creating profile for user:",
            data.user.id
          );

          // First, try to update user metadata with full name
          await supabase.auth.updateUser({
            data: { full_name: fullName },
          });

          // Direct profile insertion - simplified approach
          console.log("Creating profile directly...");
          const profileData = {
            id: data.user.id,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Insert profile directly
          const { error: insertError } = await supabase
            .from("profiles")
            .insert(profileData);

          if (insertError) {
            console.log("Profile insertion error:", insertError);
            console.log("Continuing despite profile creation error...");
          } else {
            console.log("Profile created successfully!");
          }

          // Get any profile data that might exist
          let profile = null;
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            profile = profileData;
          } catch (fetchErr) {
            console.warn("Error fetching profile after creation:", fetchErr);
          }

          // Update auth state with whatever we have
          updateAuthState({
            user: profile || { id: data.user.id, full_name: fullName },
            session: data.session,
            isLoading: false,
            error: null,
          });

          return { error: null, user: data.user };
        } catch (error: any) {
          console.error("Error in profile creation:", error);
          updateAuthState({
            user: { id: data.user.id, full_name: fullName },
            session: data.session,
            isLoading: false,
            error: `Note: User created but profile may be incomplete: ${error.message}`,
          });
          return { error: null, user: data.user };
        }
      } else {
        updateAuthState({
          isLoading: false,
        });
        return { error: new Error("No user data returned"), user: null };
      }
    } catch (error: any) {
      console.error("Unexpected error in signUp:", error);
      updateAuthState({
        error: error.message,
        isLoading: false,
      });

      // Show error toast
      toast.error("Error inesperado. Por favor, intente de nuevo.");

      return { error, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Cerrando sesión...");

      updateAuthState({ isLoading: true });

      // Call Supabase signOut
      await supabase.auth.signOut();

      // Inmediatamente limpiar el estado de autenticación
      updateAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Mostrar toast de éxito
      toast.success("Has cerrado sesión correctamente");

      // Forzar recarga completa de la página para limpiar cualquier estado persistente
      if (typeof window !== "undefined") {
        // Pequeño retraso para permitir que se muestre el toast antes de recargar
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    } catch (error: any) {
      console.error("Error signing out:", error);
      updateAuthState({
        user: null, // Aún así limpiar el usuario
        session: null,
        isLoading: false,
        error: "Error al cerrar sesión",
      });
      toast.error("Error al cerrar sesión");

      // Incluso en caso de error, intentar forzar la recarga para limpiar el estado
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!authState.user) {
        return { error: "User not authenticated" };
      }

      updateAuthState({ isLoading: true, error: null });

      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authState.user.id);

      if (error) {
        updateAuthState({ isLoading: false, error: error.message });
        return { error };
      }

      // Refresh user data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authState.user.id)
        .single();

      updateAuthState({
        user: profile || null,
        isLoading: false,
        error: null,
      });

      return { error: null };
    } catch (error: any) {
      updateAuthState({ isLoading: false, error: error.message });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
