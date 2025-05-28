// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/SupabaseAuthContext";
import { getUserProfile } from "../lib/supabase";
import SettingsNavigation from "../components/settings/SettingsNavigation";
import ProfileTab from "../components/settings/ProfileTab";
import SecurityTab from "../components/settings/SecurityTab";
import BillingTab from "../components/settings/BillingTab";
import NotificationsTab from "../components/settings/NotificationsTab";
import DangerZoneTab from "../components/settings/DangerZoneTab";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    timezone: "UTC",
    avatar_url: "",
    phone: "",
    address: "",
    website: "",
    bio: "",
  });

  // Load user profile
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userProfile = await getUserProfile(user.id);

        if (userProfile) {
          setProfile({
            display_name: userProfile.display_name || "",
            email: user.email || "",
            timezone: userProfile.timezone || "UTC",
            avatar_url: userProfile.avatar_url || "",
            phone: userProfile.phone || "",
            address: userProfile.address || "",
            website: userProfile.website || "",
            bio: userProfile.bio || "",
          });
        } else {
          setProfile((prev) => ({ ...prev, email: user.email || "" }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const renderActiveTab = () => {
    const commonProps = { user, profile, setProfile };

    switch (activeTab) {
      case "profile":
        return <ProfileTab {...commonProps} />;
      case "security":
        return <SecurityTab {...commonProps} />;
      case "billing":
        return <BillingTab {...commonProps} />;
      case "notifications":
        return <NotificationsTab {...commonProps} />;
      case "danger":
        return <DangerZoneTab {...commonProps} />;
      default:
        return <ProfileTab {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">{renderActiveTab()}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
