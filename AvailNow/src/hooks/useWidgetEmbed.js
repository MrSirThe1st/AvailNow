import { useState, useEffect } from "react";
import {
  generateWidgetEmbedCode,
  getWidgetStatistics,
} from "../lib/widgetService";
import { supabase } from "../lib/supabase";

/**
 * Custom hook to manage widget embed code generation and tracking
 * using real data from Supabase
 *
 * @param {string} userId - User ID
 * @param {Object} settings - Widget settings
 * @returns {Object} - Embed code and related methods
 */
export const useWidgetEmbed = (userId, settings) => {
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [widgetStats, setWidgetStats] = useState({
    views: 0,
    clicks: 0,
    bookings: 0,
    last_updated: null,
  });

  // Generate embed code when settings change
  useEffect(() => {
    if (!userId || !settings) return;

    try {
      const code = generateWidgetEmbedCode(userId, settings);
      setEmbedCode(code);
      setError(null);
    } catch (err) {
      console.error("Error generating embed code:", err);
      setError("Failed to generate embed code");
    }
  }, [userId, settings]);

  // Fetch widget statistics
  useEffect(() => {
    const fetchWidgetStats = async () => {
      if (!userId) return;

      try {
        const stats = await getWidgetStatistics(userId);
        setWidgetStats(stats);
      } catch (err) {
        console.error("Error fetching widget statistics:", err);
      }
    };

    fetchWidgetStats();

    // Set up real-time subscription for widget stats
    const statsSubscription = supabase
      .channel("widget_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "widget_stats",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setWidgetStats(payload.new);
        }
      )
      .subscribe();

    return () => {
      statsSubscription.unsubscribe();
    };
  }, [userId]);

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      setError("Failed to copy to clipboard");
      return false;
    }
  };

  // Generate iframe code for standalone page
  const generateIframeCode = (height = "500px") => {
    if (!userId) return "";
    return `<iframe src="https://${userId}.availnow.com" width="100%" height="${height}" frameborder="0"></iframe>`;
  };

  // Generate standalone page URL
  const getStandalonePageUrl = () => {
    if (!userId) return "";
    return `https://${userId}.availnow.com`;
  };

  // Copy standalone page URL to clipboard
  const copyStandalonePageUrl = async () => {
    try {
      await navigator.clipboard.writeText(getStandalonePageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Error copying standalone page URL:", err);
      setError("Failed to copy URL to clipboard");
      return false;
    }
  };

  return {
    embedCode,
    copied,
    error,
    stats: widgetStats,
    copyToClipboard,
    generateIframeCode,
    getStandalonePageUrl,
    copyStandalonePageUrl,
  };
};

export default useWidgetEmbed;
