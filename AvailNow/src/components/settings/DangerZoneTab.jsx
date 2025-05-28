// src/components/settings/DangerZoneTab.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { AlertTriangle, Trash2, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

const DangerZoneTab = ({ user }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAccountDeletion = async () => {
    if (!user?.id || deleteConfirmation !== "DELETE") return;

    try {
      setDeleteLoading(true);

      // Delete all user data in sequence
      const tablesToClear = [
        "availability_slots",
        "calendar_integrations",
        "calendar_settings",
        "widget_settings",
        "widget_stats",
        "user_profiles",
      ];

      for (const table of tablesToClear) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("user_id", user.id);

        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      toast.success("Account deleted successfully");
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleClearData = async (dataType) => {
    if (!user?.id) return;

    const confirmMessage = `Are you sure you want to clear all ${dataType}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      let table = "";
      switch (dataType) {
        case "availability slots":
          table = "availability_slots";
          break;
        case "widget settings":
          table = "widget_settings";
          break;
        case "calendar settings":
          table = "calendar_settings";
          break;
        case "analytics data":
          table = "widget_stats";
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(`${dataType} cleared successfully`);
    } catch (error) {
      console.error(`Error clearing ${dataType}:`, error);
      toast.error(`Failed to clear ${dataType}`);
    }
  };

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold">Delete Account</h3>
        </div>

        <p className="text-gray-600 mb-4">
          This action will permanently delete your account and all associated
          data. This cannot be undone.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-700 font-medium mb-2">
            The following data will be permanently deleted:
          </p>
          <ul className="text-sm text-red-600 space-y-1">
            <li>• Profile information and settings</li>
            <li>• All widget configurations</li>
            <li>• Calendar integrations and settings</li>
            <li>• Availability schedules and slots</li>
            <li>• Usage analytics and statistics</li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "DELETE" to confirm account deletion:
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Type DELETE here"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmation("");
            }}
            disabled={deleteLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAccountDeletion}
            disabled={deleteConfirmation !== "DELETE" || deleteLoading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {deleteLoading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
        <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
      </div>
      <div className="space-y-6">
        <div className="border border-red-300 bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-700 mb-4">
            Delete Account
          </h3>
          <p className="text-red-600 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>

          <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700 font-medium">
              Account deletion will immediately:
            </p>
            <ul className="text-sm text-red-600 mt-2 space-y-1">
              <li>• Permanently delete all your data</li>
              <li>• Deactivate all your widgets</li>
              <li>• Cancel any active subscriptions</li>
              <li>• Remove access to your custom domain (if applicable)</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </button>
        </div>

        {/* Support Contact */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're having issues with your account or considering deletion,
            our support team is here to help.
          </p>
          <a
            href="mailto:support@availnow.com"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default DangerZoneTab;
