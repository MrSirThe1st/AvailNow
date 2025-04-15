import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { signInWithClerk, auth } from "../lib/firebase";

export function useClerkUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    const setupFirebaseAuth = async () => {
      try {
        // Sign in to Firebase with Clerk token
        const fbUser = await signInWithClerk(getToken);
        setFirebaseUser(fbUser);
      } catch (err) {
        console.error("Error authenticating with Firebase:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    setupFirebaseAuth();
  }, [isLoaded, isSignedIn, user, getToken]);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFirebaseUser(user);
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    isLoaded,
    isSignedIn,
    user,
    firebaseUser,
    loading,
    error,
  };
}
