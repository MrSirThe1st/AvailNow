// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an authenticated client with the Clerk session token
export function createClerkSupabaseClient(getToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      async headers() {
        try {
          const token = await getToken({ template: "supabase" });
          if (!token) {
            console.warn("No authentication token available");
            return {};
          }
          return {
            Authorization: `Bearer ${token}`,
          };
        } catch (error) {
          console.error("Error getting Clerk token:", error);
          // Return empty headers - will cause requests to use anonymous auth
          return {};
        }
      },
    },
    auth: {
      persistSession: false, // Since we're using Clerk for auth management
    },
  });
}
