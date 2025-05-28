// src/components/settings/NotificationsTab.jsx
import React, { useState, useEffect } from "react";
import { supabase, upsertUserProfile } from "../../lib/supabase";
import { Bell, Mail, Calendar, TrendingUp, Save, Loader } from "lucide-react";
import toast from "react-hot-toast";

const NotificationsTab = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingReminders: true,
    marketingEmails: false,
    weeklyReports: true,
    newBookings: true,
    calendarSync: true,
    widgetViews: false,
    systemUpdates: true,
  });

  useEffect(() => {
    const loadNotificationSettings = async () => {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("notification_settings")
          .eq("user_id", user.id)
          .single();

        if (data?.notification_settings) {
          setNotificationSettings({
            ...notificationSettings,
            ...data.notification_settings,
          });
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    };

    loadNotificationSettings();
  }, [user?.id]);

  const handleNotificationUpdate = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await upsertUserProfile({
        user_id: user.id,
        notification_settings: notificationSettings,
        updated_at: new Date().toISOString(),
      });

      toast.success("Notification settings updated");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const NotificationToggle = ({ setting, icon, title, description }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">{icon}</div>
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => handleToggle(setting)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          notificationSettings[setting] ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            notificationSettings[setting] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">System Notifications</h3>
          <div className="space-y-4">
            <NotificationToggle
              setting="newBookings"
              icon={<Calendar className="w-5 h-5 text-green-500" />}
              title="New Bookings"
              description="Get notified immediately when someone books an appointment"
            />         
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNotificationUpdate}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
