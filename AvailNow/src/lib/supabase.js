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
            apikey: supabaseAnonKey,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          };
        } catch (error) {
          console.error("Error getting Clerk token:", error);
          return {
            apikey: supabaseAnonKey,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          };
        }
      },
    },
    auth: {
      persistSession: false, // Since we're using Clerk for auth management
    },
  });
}
