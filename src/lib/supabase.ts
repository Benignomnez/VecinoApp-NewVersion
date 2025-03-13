import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Ensure we have valid credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Check your .env.local file."
  );
}

// Create Supabase client with more reliable session handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "vecino_app_supabase_auth",
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

// Check if Supabase is reachable, use this for health checks
export const checkSupabaseHealth = async () => {
  try {
    const startTime = Date.now();
    const { error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (error) {
      console.error("Supabase health check failed:", error);
      return { healthy: false, responseTime, error: error.message };
    }

    return { healthy: true, responseTime };
  } catch (err) {
    console.error("Supabase connection error:", err);
    return {
      healthy: false,
      error: err instanceof Error ? err.message : "Unknown connection error",
    };
  }
};

export default supabase;

// Initialize storage buckets when in client side
export async function initializeStorage() {
  if (typeof window === "undefined") {
    return; // Don't run on server
  }

  // Use a timeout to prevent hanging
  return new Promise(async (resolve, reject) => {
    // Set a timeout for the entire operation
    const timeoutId = setTimeout(() => {
      console.warn("Storage initialization timed out, continuing anyway");
      resolve(undefined);
    }, 5000);

    try {
      // Check if the profiles bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        // Don't fail completely, just log the error and continue
        console.error("Error listing buckets:", error);
        clearTimeout(timeoutId);
        return resolve(undefined);
      }

      const profilesBucketExists = buckets.some(
        (bucket) => bucket.name === "profiles"
      );

      if (!profilesBucketExists) {
        // Create the profiles bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(
          "profiles",
          {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2, // 2MB
            allowedMimeTypes: [
              "image/png",
              "image/jpeg",
              "image/jpg",
              "image/gif",
              "image/webp",
            ],
          }
        );

        if (createError) {
          console.error("Error creating profiles bucket:", createError);
          // Continue anyway
        } else {
          console.log("Created profiles storage bucket");
        }
      }

      clearTimeout(timeoutId);
      resolve(undefined);
    } catch (err) {
      console.error("Error checking/creating storage buckets:", err);
      clearTimeout(timeoutId);
      // Resolve anyway to prevent breaking the app
      resolve(undefined);
    }
  });
}

// We can't call this directly here because this file is used in both client and server
// The function will be called from ClientThemeProvider
