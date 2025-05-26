import React, { useState, useEffect } from "react";
import {
  getWidgetSettings,
  saveWidgetSettings,
  generateWidgetEmbedCode,
} from "../../lib/widgetService";
import { useAuth } from "../../context/SupabaseAuthContext";
import WidgetPreview from "./WidgetPreview";
import WidgetSettingsPanel from "./settings/WidgetSettingsPanel";
import EmbedCodeDisplay from "./settings/EmbedCodeDisplay";
import toast from "react-hot-toast";

const EmbedCodeGenerator = ({ userId, initialSettings = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [widgetSettings, setWidgetSettings] = useState({
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
    fontFamily: "Public Sans",
    fontSize: "16px",
    providerName: "Dr. Sarah Johnson",
    providerAddress: "123 Healthcare Blvd, Suite 300, San Francisco, CA 94103",
    providerImage: "/api/placeholder/120/120",
  });

  const [embedCode, setEmbedCode] = useState("");

  // Load initial settings if provided or fetch from database
  useEffect(() => {
    const loadSettings = async () => {
      if (initialSettings) {
        setWidgetSettings(initialSettings);
        return;
      }

      if (!userId) return;

      try {
        setLoading(true);
        const settings = await getWidgetSettings(userId);
        setWidgetSettings({
          ...settings,
          providerName: settings.providerName || "Dr. Sarah Johnson",
          providerAddress:
            settings.providerAddress ||
            "123 Healthcare Blvd, Suite 300, San Francisco, CA 94103",
          providerImage: settings.providerImage || "/api/placeholder/120/120",
        });
      } catch (err) {
        console.error("Error loading widget settings:", err);
        setError("Failed to load widget settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId, initialSettings]);

  // Generate the embed code whenever settings change
  useEffect(() => {
    if (!userId) return;
    try {
      const code = generateWidgetEmbedCode(userId, widgetSettings);
      setEmbedCode(code);
    } catch (err) {
      console.error("Error generating embed code:", err);
    }
  }, [widgetSettings, userId]);

  // Handle setting changes
  const handleSettingChange = (setting, value) => {
    setWidgetSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Save settings to database
  const handleSaveSettings = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      await saveWidgetSettings(userId, widgetSettings);
      toast.success("Widget settings saved successfully");
    } catch (err) {
      console.error("Error saving widget settings:", err);
      toast.error("Failed to save widget settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Widget Customization</h2>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Settings panel */}
          <div className="w-1/3">
            <WidgetSettingsPanel
              settings={widgetSettings}
              onSettingChange={handleSettingChange}
            />
          </div>

          {/* Widget preview and embed code */}
          <div className="w-2/3">
            <WidgetPreview settings={widgetSettings} userId={userId} />
            <EmbedCodeDisplay embedCode={embedCode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;
