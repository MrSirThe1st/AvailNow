// src/hooks/useSupabaseAuth.js
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useSupabaseAuth() {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  // Reset client when auth state changes
  useEffect(() => {
    if (!isSignedIn) {
      setClient(null);
    }
  }, [isSignedIn]);

  const getSupabaseClient = useCallback(async () => {
    try {
      if (!isSignedIn) {
        setError("User not signed in");
        return null;
      }

      if (!client) {
        const newClient = createClerkSupabaseClient(getToken);
        setClient(newClient);
        return newClient;
      }
      return client;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [client, getToken, isSignedIn]);

  return {
    getSupabaseClient,
    error,
    isInitialized: !!client,
  };
}
