import React, { useState, useEffect } from "react";
import { Check, Clipboard, Code } from "lucide-react";

const EmbedCodeGenerator = ({ userId, previewComponent }) => {
  const [copied, setCopied] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
  });

  const [embedCode, setEmbedCode] = useState("");

  // Generate the embed code whenever settings change
  useEffect(() => {
    generateEmbedCode();
  }, [widgetSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate the embed code based on widget settings
  const generateEmbedCode = () => {
    const settingsParam = encodeURIComponent(
      JSON.stringify({
        userId,
        ...widgetSettings,
      })
    );

    const code = `<!-- AvailNow Widget -->
<div id="availnow-widget"></div>
<script src="https://widget.availnow.com/embed.js"></script>
<script>
  AvailNow.initialize({
    selector: "#availnow-widget",
    userId: "${userId}",
    theme: "${widgetSettings.theme}",
    accentColor: "${widgetSettings.accentColor}",
    textColor: "${widgetSettings.textColor}",
    buttonText: "${widgetSettings.buttonText}",
    showDays: ${widgetSettings.showDays},
    compact: ${widgetSettings.compact}
  });
</script>
<!-- End AvailNow Widget -->`;

    setEmbedCode(code);
  };

  // Handle setting changes
  const handleSettingChange = (setting, value) => {
    setWidgetSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy code to clipboard:", err);
      });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Widget Customization</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={widgetSettings.theme === "light"}
                  onChange={() => handleSettingChange("theme", "light")}
                  className="mr-2"
                />
                <span>Light</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={widgetSettings.theme === "dark"}
                  onChange={() => handleSettingChange("theme", "dark")}
                  className="mr-2"
                />
                <span>Dark</span>
              </label>
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="size"
                  checked={!widgetSettings.compact}
                  onChange={() => handleSettingChange("compact", false)}
                  className="mr-2"
                />
                <span>Standard</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="size"
                  checked={widgetSettings.compact}
                  onChange={() => handleSettingChange("compact", true)}
                  className="mr-2"
                />
                <span>Compact</span>
              </label>
            </div>
          </div>

          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
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

          {/* Days to Show */}
          <div>
            <label className="block text-sm font-medium mb-2">
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

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium mb-2">
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

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={widgetSettings.textColor}
                onChange={(e) =>
                  handleSettingChange("textColor", e.target.value)
                }
                className="mr-2 h-10 w-10 border-none"
              />
              <input
                type="text"
                value={widgetSettings.textColor}
                onChange={(e) =>
                  handleSettingChange("textColor", e.target.value)
                }
                className="flex-1 border rounded-md p-2"
                placeholder="#333333"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Widget Preview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Widget Preview</h2>
        <div className="flex justify-center p-4 border rounded-md bg-gray-50">
          {React.cloneElement(previewComponent, {
            ...widgetSettings,
            userId,
          })}
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Embed Code</h2>
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

          <pre className="bg-gray-50 p-4 pl-10 rounded-md overflow-auto text-sm border">
            {embedCode}
          </pre>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          Copy this code and paste it into your website where you want the
          widget to appear.
        </p>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;
