"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { AuthState, User } from "@/types";

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
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
}>({
  authState: { user: null, session: null, isLoading: true, error: null },
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, user: null }),
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithApple: async () => {},
  updateProfile: async () => ({ error: null }),
});

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Get user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setAuthState({
            user: profile || null,
            session,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setAuthState({
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
      if (session) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setAuthState({
          user: profile || null,
          session,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: null,
        });
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState({
          ...authState,
          error: error.message,
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      setAuthState({
        ...authState,
        error: error.message,
      });
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthState({
          ...authState,
          error: error.message,
        });
        return { error, user: null };
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          setAuthState({
            ...authState,
            error: profileError.message,
          });
          return { error: profileError, user: null };
        }
      }

      return { error: null, user: data.user };
    } catch (error: any) {
      setAuthState({
        ...authState,
        error: error.message,
      });
      return { error, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (typeof window === "undefined") return;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    if (typeof window === "undefined") return;

    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Sign in with Apple
  const signInWithApple = async () => {
    if (typeof window === "undefined") return;

    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!authState.user) {
        return { error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authState.user.id);

      if (error) {
        return { error };
      }

      // Refresh user data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authState.user.id)
        .single();

      setAuthState({
        ...authState,
        user: profile || null,
      });

      return { error: null };
    } catch (error: any) {
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
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
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
