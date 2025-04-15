// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/clerk-react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic client for unauthenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a custom hook to get authenticated Supabase client
export function useSupabaseAuth() {
  const { getToken, sessionId } = useAuth();

  // Function to get an authenticated client
  const getSupabaseClient = async () => {
    try {
      // With native integration, you don't need to specify a template
      const token = sessionId ? await getToken() : null;

      if (!token) {
        console.warn("No Clerk session found, using anonymous Supabase client");
        return supabase;
      }

      // Create an authenticated client
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    } catch (error) {
      console.error("Error creating authenticated Supabase client:", error);
      return supabase; // Fallback to anonymous client
    }
  };

  return { getSupabaseClient };
}
