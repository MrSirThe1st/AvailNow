import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  BarChart3,
} from "lucide-react";
import EmbedWidget from "../components/widgets/EmbedWidget";
import EmbedCodeGenerator from "../components/widgets/EmbedCodeGenerator";
import { useAuth } from "../context/SupabaseAuthContext";
import { useWidgetEmbed } from "../hooks/useWidgetEmbed";
import { useWidgetSettings } from "../hooks/useWidgetSettings";
import { getWidgetStatistics } from "../lib/widgetService";

const Widget = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    views: 0,
    clicks: 0,
    bookings: 0,
    last_updated: null,
  });

  // Use the custom hooks to manage widget settings and embed code
  const {
    settings,
    saveSettings: saveWidgetSettings,
    loading: settingsLoading,
  } = useWidgetSettings(user?.id);

  const { embedCode, copyToClipboard, generateIframeCode } = useWidgetEmbed(
    user?.id,
    settings
  );

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
      </div>

      {/* Widget Generator */}
      <EmbedCodeGenerator
        userId={user?.id}
        previewComponent={<EmbedWidget userId={user?.id} />}
        initialSettings={settings}
      />
    </div>
  );
};



export default Widget;
