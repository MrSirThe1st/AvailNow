// src/hooks/useClerkUser.js
import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSupabase = async () => {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        // Get the session token from Clerk
        const token = await getToken();

        if (!token) {
          console.warn("No token returned from Clerk");
          setLoading(false);
          return;
        }

        // Create a Supabase client with the Clerk token
        const client = createClerkSupabaseClient(token);
        setSupabaseClient(client);
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeSupabase();
  }, [isLoaded, isSignedIn, getToken]);

  return {
    isLoaded,
    isSignedIn,
    user,
    supabaseClient,
    loading,
  };
}
