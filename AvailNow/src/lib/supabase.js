// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createClerkSupabaseClient(getToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      async headers() {
        try {
          // Get the Supabase-specific JWT token from Clerk
          const token = await getToken({ template: "supabase" });
          if (!token) return {};

          return {
            Authorization: `Bearer ${token}`,
          };
        } catch (error) {
          console.error("Error getting Supabase auth token:", error);
          return {};
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
