// src/pages/Widget.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/SupabaseAuthContext";
import {
  getWidgetSettings,
  saveWidgetSettings,
  generateWidgetEmbedCode,
} from "../lib/widgetService";
import WidgetSettingsPanel from "../components/widgets/settings/WidgetSettingsPanel";
import EmbedCodeDisplay from "../components/widgets/settings/EmbedCodeDisplay";
import FloatingWidget from "../components/widgets/FloatingWidget";
import MobileFloatingWidget from "../components/widgets/MobileFloatingWidget";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const Widget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [widgetSettings, setWidgetSettings] = useState({
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
    fontFamily: "Public Sans",
    providerName: "Dr. Sarah Johnson",
    providerAddress: "123 Healthcare Blvd, Suite 300",
    providerImage: "/api/placeholder/120/120",
  });
  const [embedCode, setEmbedCode] = useState("");

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        setInitialLoading(true);
        const settings = await getWidgetSettings(user.id);
        setWidgetSettings({
          ...settings,
          providerName: settings.providerName || "Dr. Sarah Johnson",
          providerAddress:
            settings.providerAddress || "123 Healthcare Blvd, Suite 300",
          providerImage: settings.providerImage || "/api/placeholder/120/120",
        });
      } catch (err) {
        console.error("Error loading widget settings:", err);
        toast.error("Failed to load widget settings");
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  // Generate embed code when settings change
  useEffect(() => {
    if (!user?.id) return;
    try {
      const code = generateWidgetEmbedCode(user.id, widgetSettings);
      setEmbedCode(code);
    } catch (err) {
      console.error("Error generating embed code:", err);
    }
  }, [widgetSettings, user?.id]);

  // Handle setting changes
  const handleSettingChange = (setting, value) => {
    setWidgetSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await saveWidgetSettings(user.id, widgetSettings);
      toast.success("Widget settings saved successfully");
    } catch (err) {
      console.error("Error saving widget settings:", err);
      toast.error("Failed to save widget settings");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading widget settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Preview Widgets */}
      {previewMode === "desktop" ? (
        <FloatingWidget {...widgetSettings} userId={user?.id} />
      ) : (
        <MobileFloatingWidget {...widgetSettings} userId={user?.id} />
      )}

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
            <WidgetSettingsPanel
              settings={widgetSettings}
              onSettingChange={handleSettingChange}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            />
          </div>

          {/* Embed Code */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Embed Code</h2>
            <EmbedCodeDisplay embedCode={embedCode} />

            {/* Usage Instructions */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                How to use
              </h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Copy the embed code above</li>
                <li>2. Paste it into your website's HTML</li>
                <li>
                  3. The widget automatically adapts to desktop and mobile
                </li>
                <li>4. Visitors can book appointments directly</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
