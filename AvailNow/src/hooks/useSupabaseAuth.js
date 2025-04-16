// src/hooks/useSupabaseAuth.js
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../lib/supabase";

export function useSupabaseAuth() {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const client = createClerkSupabaseClient(getToken);
    setSupabase(client);
  }, [getToken]);

  return {
    supabase,
  };
}
