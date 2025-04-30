import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { supabase, getUserProfile, upsertUserProfile } from "../lib/supabase";

const Account = () => {
  const navigate = useNavigate();
  const { signOut, user, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const userProfile = await getUserProfile(user.id);

          if (userProfile) {
            setProfile({
              display_name: userProfile.display_name || "",
              email: user.email,
            });
          } else {
            // Initialize with email from auth if no profile exists
            setProfile({
              display_name: "",
              email: user.email,
            });
          }
        } catch (error) {
          console.error("Error loading profile:", error);
          setError("Failed to load user profile");
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Update profile in Supabase
      await upsertUserProfile({
        user_id: user.id,
        display_name: profile.display_name,
        updated_at: new Date().toISOString(),
      });

      setMessage("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Verify passwords match
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match");
      }

      // Update password in Supabase Auth
      const { error } = await updatePassword(newPassword);

      if (error) throw error;

      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            {profile.display_name
              ? profile.display_name.substring(0, 2).toUpperCase()
              : "?"}
          </div>
          <div>
            <p className="font-medium">{profile.display_name || "User"}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={profile.display_name}
              onChange={(e) =>
                setProfile({ ...profile, display_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md p-2 bg-gray-50"
              value={profile.email}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full border rounded-md p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full border rounded-md p-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Session</h3>
        <button
          onClick={handleSignOut}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Account;
