import React, { useState, useEffect } from "react";
import { Check, Clipboard, Code, Monitor, Smartphone } from "lucide-react";
import {
  getWidgetSettings,
  saveWidgetSettings,
  generateWidgetEmbedCode,
} from "../../lib/widgetService";
import { useAuth } from "../../context/SupabaseAuthContext";
import WidgetPreview from "./WidgetPreview";
import toast from "react-hot-toast";

const EmbedCodeGenerator = ({ userId, initialSettings = null }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
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

  // Color preset options
  const colorPresets = [
    { primary: "#FF5F1F", secondary: "#5928E5" }, // Orange-Purple
    { primary: "#FF69B4", secondary: "#00CED1" }, // Pink-Turquoise
    { primary: "#2ECC71", secondary: "#3498DB" }, // Green-Blue
    { primary: "#3498DB", secondary: "#F39C12" }, // Blue-Orange
    { primary: "#27AE60", secondary: "#E74C3C" }, // Green-Red
    { primary: "#8E44AD", secondary: "#D35400" }, // Purple-Brown
  ];

  // Font family options
  const fontOptions = [
    { name: "Public Sans", preview: "Aa", class: "font-sans" },
    { name: "Inter", preview: "Aa", class: "font-serif" },
    { name: "DM Sans", preview: "Aa", class: "font-mono" },
    { name: "Nunito Sans", preview: "Aa", class: "font-mono" },
  ];

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
      // Generate universal responsive widget code
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

  // Apply color preset
  const applyColorPreset = (preset) => {
    setWidgetSettings((prev) => ({
      ...prev,
      accentColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setWidgetSettings((prev) => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light",
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

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy code to clipboard:", err);
      toast.error("Failed to copy code");
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
          <div className="w-1/3 bg-gray-50 rounded-lg p-4">
            {/* Toggle options */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Dark mode</span>
                </div>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${widgetSettings.theme === "dark" ? "bg-primary" : "bg-gray-200"}`}
                  onClick={toggleDarkMode}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${widgetSettings.theme === "dark" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </div>
              </div>
            </div>

            {/* Color presets */}
            <div className="mt-6">
              <div className="mb-2 p-2 rounded bg-gray-800 text-white text-xs font-medium inline-block">
                Presets
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {colorPresets.map((preset, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 rounded-lg bg-white p-2 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary"
                    onClick={() => applyColorPreset(preset)}
                  >
                    <div className="w-10 h-10 rounded-full relative overflow-hidden">
                      <div
                        className="absolute inset-0 left-1/2 bg-gradient-to-r"
                        style={{
                          background: `linear-gradient(to right, ${preset.primary} 50%, ${preset.secondary} 50%)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Font selection */}
            <div className="mt-6">
              <div className="mb-2 p-2 rounded bg-gray-800 text-white text-xs font-medium inline-block">
                Font
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Family</p>
                <div className="grid grid-cols-2 gap-3">
                  {fontOptions.map((font) => (
                    <div
                      key={font.name}
                      className={`p-3 rounded-lg flex flex-col items-center cursor-pointer hover:bg-gray-100 ${widgetSettings.fontFamily === font.name ? "bg-gray-100 ring-1 ring-primary" : "bg-white"}`}
                      onClick={() =>
                        handleSettingChange("fontFamily", font.name)
                      }
                    >
                      <span
                        className={`text-xl ${font.class} ${widgetSettings.fontFamily === font.name ? "text-primary" : "text-gray-400"}`}
                      >
                        {font.preview}
                      </span>
                      <span className="text-xs mt-2">{font.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Button text input */}
            <div className="mt-8">
              <label className="block text-sm font-medium mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={widgetSettings.buttonText}
                onChange={(e) =>
                  handleSettingChange("buttonText", e.target.value)
                }
                className="w-full border rounded-md p-2"
                placeholder="Check Availability"
              />
            </div>

            {/* Provider Name input */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Provider Name
              </label>
              <input
                type="text"
                value={widgetSettings.providerName}
                onChange={(e) =>
                  handleSettingChange("providerName", e.target.value)
                }
                className="w-full border rounded-md p-2"
                placeholder="Dr. Sarah Johnson"
              />
            </div>

            {/* Provider Address input */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Provider Address
              </label>
              <input
                type="text"
                value={widgetSettings.providerAddress}
                onChange={(e) =>
                  handleSettingChange("providerAddress", e.target.value)
                }
                className="w-full border rounded-md p-2"
                placeholder="123 Main St, City, ST 12345"
              />
            </div>

            {/* Days to show selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Days to Show
              </label>
              <select
                value={widgetSettings.showDays}
                onChange={(e) =>
                  handleSettingChange("showDays", parseInt(e.target.value))
                }
                className="w-full border rounded-md p-2"
              >
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </select>
            </div>

            {/* Custom color pickers */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Accent Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={widgetSettings.accentColor}
                  onChange={(e) =>
                    handleSettingChange("accentColor", e.target.value)
                  }
                  className="mr-2 h-10 w-10 border-none"
                />
                <input
                  type="text"
                  value={widgetSettings.accentColor}
                  onChange={(e) =>
                    handleSettingChange("accentColor", e.target.value)
                  }
                  className="flex-1 border rounded-md p-2"
                  placeholder="#0070f3"
                />
              </div>
            </div>
          </div>
          {/* Widget preview and embed code */}
          <div className="w-2/3">
            {/* Widget preview component */}
            <WidgetPreview settings={widgetSettings} userId={userId} />

            {/* Embed Code */}
            <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Embed Code</h3>

                {/* Copy button */}
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Clipboard size={16} className="mr-1" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute top-3 left-3 text-gray-400">
                  <Code size={16} />
                </div>

                <pre className="bg-gray-50 p-4 pl-10 rounded-md overflow-auto text-sm border text-gray-700 max-h-60">
                  {embedCode}
                </pre>
              </div>

              <p className="mt-4 text-xs text-gray-600">
                This code automatically adapts to both desktop and mobile
                devices. Copy and paste it into your website where you want the
                widget to appear.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;
