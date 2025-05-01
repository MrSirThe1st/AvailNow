import React, { useState, useEffect } from "react";
import {
  Code,
  Share2,
  Globe,
  Clipboard,
  Check,
  ExternalLink,
  BarChart3,
  Palette,
  ChevronDown,
  Save,
  Info,
} from "lucide-react";
import EmbedWidget from "../components/widgets/EmbedWidget";
import EmbedCodeGenerator from "../components/widgets/EmbedCodeGenerator";
import { useAuth } from "../context/SupabaseAuthContext";
import { useWidgetEmbed } from "../hooks/useWidgetEmbed";
import { useWidgetSettings } from "../hooks/useWidgetSettings";
import { getWidgetStatistics } from "../lib/widgetService";
import toast from "react-hot-toast";

const Widget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    views: 0,
    clicks: 0,
    bookings: 0,
    last_updated: null,
  });

  // Use the custom hooks to manage widget settings and embed code
  const {
    settings,
    updateSettings,
    saveSettings: saveWidgetSettings,
    loading: settingsLoading,
  } = useWidgetSettings(user?.id);

  const {
    embedCode,
    copyToClipboard,
    getStandalonePageUrl,
    copyStandalonePageUrl,
    generateIframeCode,
  } = useWidgetEmbed(user?.id, settings);

  const standalonePage = getStandalonePageUrl();

  // Fetch widget statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const widgetStats = await getWidgetStatistics(user.id);
        setStats(widgetStats);
        setError(null);
      } catch (err) {
        console.error("Error fetching widget statistics:", err);
        setError("Failed to load widget statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Format date from ISO string
  const formatDate = (isoString) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Handle copying standalone page URL
  const handleCopyStandaloneUrl = async () => {
    const success = await copyStandalonePageUrl();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("URL copied to clipboard");
    } else {
      toast.error("Failed to copy URL");
    }
  };

  // Handle saving settings
  const handleSaveSettings = async () => {
    const success = await saveWidgetSettings();
    if (success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error("Failed to save settings");
    }
  };

  if (loading && !user) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading widget settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 my-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-3 bg-blue-100 rounded-full mr-4">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Views</p>
            <p className="text-2xl font-bold">{stats.views || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <ExternalLink size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Clicks</p>
            <p className="text-2xl font-bold">{stats.clicks || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-3 bg-violet-100 rounded-full mr-4">
            <Code size={20} className="text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Bookings</p>
            <p className="text-2xl font-bold">{stats.bookings || 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center">
          <div className="p-3 bg-amber-100 rounded-full mr-4">
            <Share2 size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium">
              {formatDate(stats.last_updated)}
            </p>
          </div>
        </div>
      </div>

      {/* Widget Generator */}
      <EmbedCodeGenerator
        userId={user?.id}
        previewComponent={<EmbedWidget userId={user?.id} />}
        initialSettings={settings}
      />

      {/* Main Widget Configuration Section */}
      <div className="bg-white p-6 my-4 rounded-lg shadow-md mb-6 transition-all">
        <div className="animate-fade-in">
          <div className="mb-6 p-5 bg-blue-50 rounded-lg text-blue-700 text-sm border border-blue-100 flex items-start">
            <Globe
              size={18}
              className="mr-3 mt-0.5 flex-shrink-0 text-blue-500"
            />
            <div>
              <h3 className="font-semibold mb-1">Standalone Page</h3>
              <p>
                Share this direct link to your availability page. It works great
                for social media profiles, email signatures, or anywhere you
                can't embed code.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Your availability page</h2>

          <div className="mb-6 overflow-hidden rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-50 p-4 border-r text-gray-700 break-all font-mono text-sm">
                {standalonePage}
              </div>
              <button
                className="px-4 py-4 bg-primary text-white hover:bg-primary/90 transition-colors flex items-center whitespace-nowrap"
                onClick={handleCopyStandaloneUrl}
              >
                {copied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Clipboard size={16} className="mr-2" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Eye size={16} className="mr-2 text-gray-500" />
                Preview
              </h3>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-center shadow-inner">
                <EmbedWidget userId={user?.id} />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Share size={16} className="mr-2 text-gray-500" />
                Share Your Page
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <FacebookIcon />,
                    title: "Facebook",
                    description: "Post on your timeline",
                    color: "bg-blue-100 text-blue-500",
                  },
                  {
                    icon: <TwitterIcon />,
                    title: "Twitter",
                    description: "Tweet your page",
                    color: "bg-sky-100 text-sky-500",
                  },
                  {
                    icon: <LinkedInIcon />,
                    title: "LinkedIn",
                    description: "Share professionally",
                    color: "bg-indigo-100 text-indigo-500",
                  },
                  {
                    icon: <MailIcon />,
                    title: "Email",
                    description: "Add to your signature",
                    color: "bg-red-100 text-red-500",
                  },
                ].map((platform, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 ${platform.color} rounded-md flex items-center justify-center mr-2`}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {platform.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Settings Section - MODERNIZED */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold flex items-center">
            <Palette size={18} className="mr-2 text-primary" />
            Appearance Settings
          </h2>
          <button
            onClick={handleSaveSettings}
            disabled={settingsLoading}
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center transition-all hover:bg-primary/90 disabled:opacity-70"
          >
            {settingsLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg mb-6 text-sm border border-gray-100">
          <p className="flex items-center text-gray-600">
            <Info size={16} className="mr-2 text-gray-400" />
            These settings apply to both your embedded widget and standalone
            page
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 transition-all border border-gray-100 hover:border-gray-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Header Style
            </label>
            <div className="relative">
              <select
                className="w-full border rounded-md p-2 pr-10 appearance-none bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={settings.headerStyle || "modern"}
                onChange={(e) =>
                  updateSettings({ headerStyle: e.target.value })
                }
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="mt-2">
              <div
                className={`h-6 w-full rounded mt-2 ${settings.headerStyle === "modern" ? "bg-gradient-to-r from-primary to-primary/70" : settings.headerStyle === "classic" ? "bg-gray-700" : "bg-gray-100 border border-gray-200"}`}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 transition-all border border-gray-100 hover:border-gray-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Font Family
            </label>
            <div className="relative">
              <select
                className="w-full border rounded-md p-2 pr-10 appearance-none bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={settings.fontFamily || "system"}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
              >
                <option value="system">System Default</option>
                <option value="sans-serif">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { name: "system", label: "System Default", class: "" },
                { name: "sans-serif", label: "Sans Serif", class: "font-sans" },
                { name: "serif", label: "Serif", class: "font-serif" },
                { name: "monospace", label: "Monospace", class: "font-mono" },
              ].map((font, index) => (
                <div
                  key={index}
                  className={`text-center p-1 text-xs rounded ${settings.fontFamily === font.name ? "bg-primary/10 text-primary" : "bg-white text-gray-700"} ${font.class}`}
                >
                  Aa
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 transition-all border border-gray-100 hover:border-gray-200">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Border Radius
            </label>
            <div className="relative">
              <select
                className="w-full border rounded-md p-2 pr-10 appearance-none bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                value={settings.borderRadius || "medium"}
                onChange={(e) =>
                  updateSettings({ borderRadius: e.target.value })
                }
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <div className="flex justify-between mt-3">
              {[
                { name: "none", radius: "0px" },
                { name: "small", radius: "4px" },
                { name: "medium", radius: "8px" },
                { name: "large", radius: "12px" },
              ].map((option, index) => (
                <div
                  key={index}
                  className={`h-8 w-8 border-2 ${settings.borderRadius === option.name ? "border-primary" : "border-gray-300"}`}
                  style={{ borderRadius: option.radius }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility components
const Eye = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Share = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" x2="12" y1="2" y2="15" />
  </svg>
);

const Loader2 = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// Social media icons
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7l-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z" />
  </svg>
);

export default Widget;
