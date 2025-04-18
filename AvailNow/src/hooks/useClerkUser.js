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
    if (!isLoaded) {
      return;
    }

    const initializeSupabase = async () => {
      try {
        if (isSignedIn) {
          // Create a Supabase client that uses the Clerk session token
          const client = createClerkSupabaseClient(() => getToken());
          setSupabaseClient(client);
        } else {
          setSupabaseClient(null);
        }
      } catch (err) {
        console.error("Error initializing Supabase client:", err);
        setSupabaseClient(null);
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
