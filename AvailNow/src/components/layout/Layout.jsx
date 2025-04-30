// src/components/layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../../context/SupabaseAuthContext";
import { getUserProfile } from "../../lib/supabase";
import { Loader } from "lucide-react";

const Layout = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile when user is available
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  // Show loading spinner while authentication is in progress
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mb-4 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar profile={userProfile} />
      <main className="flex-1 p-4 md:p-6 mx-auto w-full max-w-7xl">
        <Outlet context={{ user, profile: userProfile }} />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
