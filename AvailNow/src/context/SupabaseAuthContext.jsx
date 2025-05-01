import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const SupabaseAuthContext = createContext();

export function useAuth() {
  return useContext(SupabaseAuthContext);
}

export function SupabaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
     const searchParams = new URLSearchParams(window.location.search);
     const token =
       searchParams.get("token") || searchParams.get("access_token");
     const type = searchParams.get("type");

     if (token && type === "recovery") {
       setLoading(true);
       // This will update the session automatically
       supabase.auth.onAuthStateChange((event, session) => {
         if (event === "PASSWORD_RECOVERY") {
           console.log("Password recovery flow detected");
           setSession(session);
           setUser(session?.user || null);
           setLoading(false);
         }
       });
     }

     // Continue listening for auth changes
     const {
       data: { subscription },
     } = supabase.auth.onAuthStateChange((_event, session) => {
       setSession(session);
       setUser(session?.user || null);
       setLoading(false);
     });


    return () => subscription.unsubscribe();
  }, []);

  // Signup function
  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  // Login function
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // Login with Google
  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  }

  // Logout function
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Password reset request
  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  }

  // Update user password
  async function updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  }

  const value = {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    user,
    session,
    loading,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
