import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    try {
      const client = createClerkSupabaseClient(getToken);
      setSupabaseClient(client);
    } catch (err) {
      console.error("Error initializing Supabase client:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  return {
    isLoaded,
    isSignedIn,
    user,
    supabaseClient,
    loading,
    error,
  };
}
