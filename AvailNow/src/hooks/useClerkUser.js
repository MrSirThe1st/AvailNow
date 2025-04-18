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
      setLoading(false);
      return;
    }

    const initSupabase = async () => {
      try {
        if (isSignedIn) {
          const client = createClerkSupabaseClient(() =>
            getToken({ template: "supabase" })
          );
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

    initSupabase();
  }, [isLoaded, isSignedIn, getToken]);

  return {
    isLoaded,
    isSignedIn,
    user,
    supabaseClient,
    loading,
  };
}
