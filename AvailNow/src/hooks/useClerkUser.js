import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setSupabaseUser(user);
    setLoading(false);
  }, [isLoaded, isSignedIn, user]);

  async function getSupabaseClient() {
    if (!isSignedIn) return null;
    return createClerkSupabaseClient();
  }

  return {
    isLoaded,
    isSignedIn,
    user,
    supabaseUser,
    loading,
    error,
    getSupabaseClient,
  };
}
