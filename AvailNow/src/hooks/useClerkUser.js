// src/hooks/useClerkUser.js
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    const syncUserWithSupabase = async () => {
      try {
        // Check if user exists in Supabase
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching user:", error);
        }

        if (!data) {
          // Create new user in Supabase
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              clerk_id: user.id,
              email: user.primaryEmailAddress.emailAddress,
              name: `${user.firstName} ${user.lastName}`.trim(),
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating user:", createError);
          } else {
            setSupabaseUser(newUser);
          }
        } else {
          setSupabaseUser(data);
        }
      } catch (error) {
        console.error("Error in user sync:", error);
      } finally {
        setLoading(false);
      }
    };

    syncUserWithSupabase();
  }, [isLoaded, isSignedIn, user]);

  return { isLoaded, isSignedIn, clerkUser: user, supabaseUser, loading };
}
