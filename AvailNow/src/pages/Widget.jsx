// src/pages/Widget.jsx
import React, { useState, useEffect } from "react";
import { Loader, Info } from "lucide-react";
import { useAuth } from "../context/SupabaseAuthContext";
import EmbedCodeGenerator from "../components/widgets/EmbedCodeGenerator";
import { getWidgetSettings, getWidgetStatistics } from "../lib/widgetService";

const Widget = () => {
  const { user } = useAuth();
  const [widgetSettings, setWidgetSettings] = useState(null);
  const [widgetStats, setWidgetStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWidgetData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load widget settings and statistics in parallel
        const [settings, stats] = await Promise.all([
          getWidgetSettings(user.id),
          getWidgetStatistics(user.id),
        ]);

        setWidgetSettings(settings);
        setWidgetStats(stats);
      } catch (err) {
        console.error("Error loading widget data:", err);
        setError("Failed to load widget data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadWidgetData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading widget data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Widget Configuration</h1>
        <p className="text-gray-600 mb-6">
          Customize your AvailNow widget and get the embed code to add it to
          your website.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <div className="flex">
              <Info className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Widget statistics */}
        {widgetStats && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Widget Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Views</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {widgetStats.views || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Number of times your widget has been loaded
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Clicks</h3>
                <p className="text-3xl font-bold text-green-600">
                  {widgetStats.clicks || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Number of users who have interacted with the widget
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Bookings</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {widgetStats.bookings || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Number of bookings initiated through the widget
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Embed code generator with interactive preview */}
        <EmbedCodeGenerator
          userId={user?.id}
          initialSettings={widgetSettings}
        />
      </div>
    </div>
  );
};

export default Widget;
