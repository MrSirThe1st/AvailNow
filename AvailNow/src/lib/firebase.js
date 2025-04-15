import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { doc } from "firebase/firestore";
// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);

// Sign in to Firebase with a Clerk-issued JWT
export const signInWithClerk = async (getToken) => {
  try {
    // Get a custom token from your server (you'll need to implement this)
    // This token should be created on your backend using Firebase Admin SDK
    // based on the Clerk user's identity
    const clerkToken = await getToken({ template: "firebase" });

    // Sign in to Firebase with the custom token
    const userCredential = await signInWithCustomToken(auth, clerkToken);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with Clerk token:", error);
    throw error;
  }
};

// Helper function to create a Firestore document reference
export const createDocRef = (collection, id) => {
  return doc(firestore, collection, id);
};
