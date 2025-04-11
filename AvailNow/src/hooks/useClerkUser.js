// src/hooks/useClerkUser.js
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) {
      setLoading(false);
      return;
    }

    const syncUserWithSupabase = async () => {
      try {
        if (!isSignedIn || !user) {
          setSupabaseUser(null);
          return;
        }

        // Use upsert to handle both create and update in one operation
        const { data, error: supabaseError } = await supabase
          .from("users")
          .upsert(
            {
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            },
            {
              onConflict: "clerk_id", // This is the key to avoid duplicates
              ignoreDuplicates: false, // Set to true if you want to skip updates
            }
          )
          .select()
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        setSupabaseUser(data);
      } catch (err) {
        console.error("User sync error:", err);
        setError(err);
        
        // Handle specific error cases
        if (err.code === "23505") { // Unique violation
          // Try to fetch the existing user
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("clerk_id", user.id)
            .single();
          
          if (data) setSupabaseUser(data);
        }
      } finally {
        setLoading(false);
      }
    };

    syncUserWithSupabase();
  }, [isLoaded, isSignedIn, user]);

  return { isLoaded, isSignedIn, clerkUser: user, supabaseUser, loading, error };
}