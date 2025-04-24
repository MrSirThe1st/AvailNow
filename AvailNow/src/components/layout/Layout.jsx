import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
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
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header profile={userProfile} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet context={{ user, profile: userProfile }} />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
