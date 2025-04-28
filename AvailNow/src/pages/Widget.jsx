import React, { useState, useEffect } from "react";
import { Code, Share2, Globe } from "lucide-react";
import EmbedWidget from "../components/widgets/EmbedWidget";
import EmbedCodeGenerator from "../components/widgets/EmbedCodeGenerator";
import { useAuth } from "../context/SupabaseAuthContext";
import { getWidgetSettings } from "../lib/supabaseHelpers";

const Widget = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("website");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [widgetSettings, setWidgetSettings] = useState(null);

  // URL for the standalone page - using user's ID
  const standalonePage = user
    ? `https://${user.id}.availnow.com`
    : `https://yourusername.availnow.com`;

  // Load widget settings on component mount
  useEffect(() => {
    const loadWidgetSettings = async () => {
      if (user) {
        try {
          setLoading(true);
          const settings = await getWidgetSettings(user.id);
          setWidgetSettings(settings);
          setError(null);
        } catch (err) {
          console.error("Error loading widget settings:", err);
          setError("Failed to load widget settings");
        } finally {
          setLoading(false);
        }
      }
    };

    loadWidgetSettings();
  }, [user]);

  // Handle copying standalone page URL
  const copyStandalonePage = () => {
    navigator.clipboard
      .writeText(standalonePage)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL to clipboard:", err);
      });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading widget settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Widget Configuration</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex border-b mb-4">
          <button
            className={`pb-2 px-4 flex items-center ${
              activeTab === "website"
                ? "border-b-2 border-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("website")}
          >
            <Code size={18} className="mr-2" />
            Website Widget
          </button>
          <button
            className={`pb-2 px-4 flex items-center ${
              activeTab === "standalone"
                ? "border-b-2 border-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("standalone")}
          >
            <Globe size={18} className="mr-2" />
            Standalone Page
          </button>
        </div>

        {activeTab === "website" ? (
          <div>
            <div className="mb-6 p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
              <p className="flex items-start">
                <Share2 size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Web Widget:</strong> Add your availability widget
                  directly to your website. Customize it below and copy the
                  generated code to paste into your site.
                </span>
              </p>
            </div>

            <EmbedCodeGenerator
              userId={user?.id}
              previewComponent={<EmbedWidget userId={user?.id} />}
              initialSettings={widgetSettings}
            />
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-blue-50 rounded-md text-blue-700 text-sm">
              <p className="flex items-start">
                <Globe size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Standalone Page:</strong> Share this direct link to
                  your availability page. It works great for social media
                  profiles, email signatures, or anywhere you can't embed code.
                </span>
              </p>
            </div>

            <h2 className="text-lg font-semibold mb-4">
              Your availability page
            </h2>

            <div className="mb-6">
              <div className="flex items-center">
                <div className="flex-1 bg-gray-50 p-4 rounded-l-md border-t border-b border-l text-gray-700 break-all">
                  {standalonePage}
                </div>
                <button
                  className="px-4 py-4 bg-primary text-white rounded-r-md border border-primary hover:bg-primary-dark transition-colors"
                  onClick={copyStandalonePage}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="border rounded-md p-4 bg-gray-50 flex justify-center">
                  <EmbedWidget userId={user?.id} />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Share Your Page</h3>
                <div className="space-y-4">
                  <div className="border rounded-md p-4 hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Share on Facebook</h4>
                        <p className="text-sm text-gray-500">
                          Post your availability page to your timeline
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Share on Twitter</h4>
                        <p className="text-sm text-gray-500">
                          Tweet your availability page
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Share on LinkedIn</h4>
                        <p className="text-sm text-gray-500">
                          Share your availability page on LinkedIn
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 hover:border-primary transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7l-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Add to Email Signature</h4>
                        <p className="text-sm text-gray-500">
                          Include in your email signature
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appearance settings section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
        <p className="text-gray-600 mb-4">
          These settings apply to both your embedded widget and standalone page.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Header Style
            </label>
            <select className="w-full border rounded-md p-2">
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Font Family
            </label>
            <select className="w-full border rounded-md p-2">
              <option value="system">System Default</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Border Radius
            </label>
            <select className="w-full border rounded-md p-2">
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Widget;
