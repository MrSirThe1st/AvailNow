import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [isLoaded, isSignedIn, user]);

  async function getSupabaseClient() {
    if (!getToken) return null;
    return createClerkSupabaseClient(getToken);
  }

  return {
    isLoaded,
    isSignedIn,
    user,
    loading,
    error,
    getSupabaseClient,
  };
}
