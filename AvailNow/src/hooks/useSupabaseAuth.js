// src/hooks/useSupabaseAuth.js
import { useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useSupabaseAuth() {
  const { getToken } = useAuth();
  const [client, setClient] = useState(null);

  const getSupabaseClient = useCallback(async () => {
    if (!client) {
      const newClient = createClerkSupabaseClient(getToken);
      setClient(newClient);
      return newClient;
    }
    return client;
  }, [client, getToken]);

  return { getSupabaseClient };
}
