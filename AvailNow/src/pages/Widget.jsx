// src/pages/Widget.jsx - Simplified Version
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
    companyLogo: null,

    // Simplified Business Hours
    businessHours: {
      startTime: "09:00",
      endTime: "17:00",
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    },

    // Booking Settings
    bookingType: "direct", // "direct", "contact", "custom"
    contactInfo: {
      phone: "",
      email: "",
      website: "",
      message: "Call us to schedule your appointment",
    },
    customInstructions: {
      title: "How to Book",
      message: "Contact us to schedule your appointment",
      buttonText: "Contact Us",
      actionUrl: "",
    },
  });
  const [embedCode, setEmbedCode] = useState("");

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        setInitialLoading(true);
        const settings = await getWidgetSettings(user.id);

        // Parse JSON fields if they exist as strings
        let parsedSettings = { ...settings };

        if (typeof settings.contactInfo === "string") {
          try {
            parsedSettings.contactInfo = JSON.parse(settings.contactInfo);
          } catch (e) {
            console.warn("Failed to parse contactInfo:", e);
          }
        }

        if (typeof settings.customInstructions === "string") {
          try {
            parsedSettings.customInstructions = JSON.parse(
              settings.customInstructions
            );
          } catch (e) {
            console.warn("Failed to parse customInstructions:", e);
          }
        }

        setWidgetSettings({
          ...parsedSettings,
          providerName: parsedSettings.providerName || "Dr. Sarah Johnson",
          providerAddress:
            parsedSettings.providerAddress || "123 Healthcare Blvd, Suite 300",
          companyLogo: parsedSettings.companyLogo || null,
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
          <h2 className="text-lg font-semibold">Widget Customization</h2>
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
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <WidgetSettingsPanel
              settings={widgetSettings}
              onSettingChange={handleSettingChange}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              userId={user?.id}
            />
          </div>

          {/* Embed Code */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
            <EmbedCodeDisplay embedCode={embedCode} />

            {/* Usage Instructions */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                How to use
              </h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Copy the embed code above</li>
                <li>2. Paste it into your website's HTML</li>
                <li>
                  3. The widget automatically adapts to desktop and mobile
                </li>
                <li>4. Visitors can see availability and book appointments</li>
              </ol>
            </div>

            {/* Business Hours Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Current Settings
              </h4>
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Hours:</strong>{" "}
                  {widgetSettings.businessHours.startTime} -{" "}
                  {widgetSettings.businessHours.endTime}
                </p>
                <p>
                  <strong>Working Days:</strong>{" "}
                  {widgetSettings.businessHours.workingDays
                    .map((day) => {
                      const days = [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                      ];
                      return days[day];
                    })
                    .join(", ")}
                </p>
                <p>
                  <strong>Booking Type:</strong>{" "}
                  {widgetSettings.bookingType === "direct"
                    ? "Direct Booking"
                    : widgetSettings.bookingType === "contact"
                      ? "Contact to Book"
                      : "Custom Instructions"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
