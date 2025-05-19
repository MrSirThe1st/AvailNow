/**
 * Widget Service - Provides methods for widget management and customization
 * This service handles widget settings, customization, and generating embed codes
 * with real data from Supabase instead of mocks
 */

import { supabase } from "./supabase";

/**
 * Get widget settings for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Widget settings
 */
export const getWidgetSettings = async (userId) => {
  try {
    if (!userId) {
      return getDefaultWidgetSettings();
    }

    const { data, error } = await supabase
      .from("widget_settings")
      .select(
        "id, user_id, theme, accent_color, text_color, button_text, show_days, compact"
      )
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle instead of single

    if (error) {
      console.warn("Error fetching widget settings:", error);
      return getDefaultWidgetSettings();
    }

    return data || getDefaultWidgetSettings();
  } catch (error) {
    console.error("Error fetching widget settings:", error);
    return getDefaultWidgetSettings();
  }
};

/**
 * Get default widget settings
 * @returns {Object} - Default widget settings
 */
export const getDefaultWidgetSettings = () => {
  return {
    theme: "light",
    accentColor: "#0070f3",
    textColor: "#333333",
    buttonText: "Check Availability",
    showDays: 5,
    compact: false,
    headerStyle: "modern",
    fontFamily: "system",
    borderRadius: "medium",
  };
};

/**
 * Generate a universal widget embed code for a user that works on all devices
 * @param {string} userId - Supabase or Clerk user ID
 * @param {Object} settings - Widget settings
 * @returns {string} - HTML embed code
 */
export const generateWidgetEmbedCode = (userId, settings) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const settingsToUse = settings || getDefaultWidgetSettings();

  return `<!-- AvailNow Widget -->
<script src="https://widget.availnow.com/embed.js"></script>
<script>
  AvailNow.initialize({
    userId: "${userId}",
    theme: "${settingsToUse.theme}",
    accentColor: "${settingsToUse.accentColor}",
    textColor: "${settingsToUse.textColor}",
    buttonText: "${settingsToUse.buttonText}",
    showDays: ${settingsToUse.showDays},
    compact: ${settingsToUse.compact},
    responsive: true,
    providerName: "${settingsToUse.providerName || ""}",
    providerAddress: "${settingsToUse.providerAddress || ""}",
    providerImage: "${settingsToUse.providerImage || ""}"
  });
</script>
<!-- End AvailNow Widget -->`;
};

/**
 * For backward compatibility - returns the same code as generateWidgetEmbedCode
 * @param {string} userId - Supabase or Clerk user ID
 * @param {Object} settings - Widget settings
 * @returns {string} - HTML embed code for mobile
 */
export const generateMobileWidgetEmbedCode = (userId, settings) => {
  return generateWidgetEmbedCode(userId, settings);
};

/**
 * For backward compatibility - returns the same code as generateWidgetEmbedCode
 * @param {string} userId - Supabase or Clerk user ID
 * @param {Object} settings - Widget settings
 * @returns {string} - HTML embed code for responsive widget
 */
export const generateResponsiveWidgetEmbedCode = (userId, settings) => {
  return generateWidgetEmbedCode(userId, settings);
};

/**
 * Get widget statistics for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Widget usage statistics
 */
export const getWidgetStatistics = async (userId) => {
  if (!userId) {
    return {
      views: 0,
      clicks: 0,
      bookings: 0,
      last_updated: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase
      .from("widget_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return (
      data || {
        views: 0,
        clicks: 0,
        bookings: 0,
        last_updated: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error("Error fetching widget statistics:", error);
    return {
      views: 0,
      clicks: 0,
      bookings: 0,
      last_updated: new Date().toISOString(),
    };
  }
};

/**
 * Track a widget event (view, click, booking)
 * @param {string} userId - Supabase user ID
 * @param {string} eventType - Type of event ('view', 'click', 'booking')
 * @returns {Promise<void>}
 */
export const trackWidgetEvent = async (userId, eventType) => {
  if (!userId || !eventType) {
    return; // Silently fail if required parameters are missing
  }

  try {
    // First get current stats
    const { data: stats, error: statsError } = await supabase
      .from("widget_stats")
      .select("id, views, clicks, bookings")
      .eq("user_id", userId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      throw statsError;
    }

    const now = new Date().toISOString();

    if (stats) {
      // Update existing stats
      const updates = {
        last_updated: now,
      };

      if (eventType === "view") updates.views = (stats.views || 0) + 1;
      if (eventType === "click") updates.clicks = (stats.clicks || 0) + 1;
      if (eventType === "booking") updates.bookings = (stats.bookings || 0) + 1;

      const { error: updateError } = await supabase
        .from("widget_stats")
        .update(updates)
        .eq("id", stats.id);

      if (updateError) throw updateError;
    } else {
      // Create new stats record
      const newStats = {
        user_id: userId,
        views: eventType === "view" ? 1 : 0,
        clicks: eventType === "click" ? 1 : 0,
        bookings: eventType === "booking" ? 1 : 0,
        last_updated: now,
      };

      const { error: insertError } = await supabase
        .from("widget_stats")
        .insert(newStats);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error("Error tracking widget event:", error);
    // Don't throw - widget tracking should fail silently
  }
};

/**
 * Save widget settings for a user
 * @param {string} userId - Supabase user ID
 * @param {Object} settings - Widget settings to save
 * @returns {Promise<Object>} - Updated widget settings
 */
export const saveWidgetSettings = async (userId, settings) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Check if settings already exist for this user
    const { data: existingSettings, error: checkError } = await supabase
      .from("widget_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    const now = new Date().toISOString();

    // Add user_id and updated timestamp
    const settingsWithMeta = {
      ...settings,
      user_id: userId,
      updated_at: now,
    };

    let result;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("widget_settings")
        .update(settingsWithMeta)
        .eq("id", existingSettings.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new settings
      settingsWithMeta.created_at = now;

      const { data, error } = await supabase
        .from("widget_settings")
        .insert(settingsWithMeta)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error("Error saving widget settings:", error);
    throw error;
  }
};

/**
 * Get user profile data, including display name and address
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfileForWidget = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfileForWidget:", error);
    return null;
  }
};

/**
 * Get availability for a specific date range
 * @param {string} userId - Supabase user ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Availability slots
 */
export const getAvailabilityForDateRange = async (
  userId,
  startDate,
  endDate
) => {
  if (!userId) {
    return [];
  }

  try {
    // Fetch availability slots from Supabase
    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", startDate.toISOString())
      .lte("end_time", endDate.toISOString())
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
};

/**
 * Get calendar integration status for user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Array>} Array of connected calendar integrations
 */
export const getCalendarIntegrations = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("calendar_integrations")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching calendar integrations:", error);
    return [];
  }
};

/**
 * Get real data for widget
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Widget data
 */
export const getWidgetData = async (userId) => {
  if (!userId) {
    return {
      settings: getDefaultWidgetSettings(),
      profile: null,
      stats: {
        views: 0,
        clicks: 0,
        bookings: 0,
      },
      availability: [],
      hasCalendarIntegration: false,
    };
  }

  try {
    // Get all data in parallel to optimize performance
    const [settings, profile, stats, integrations] = await Promise.all([
      getWidgetSettings(userId),
      getUserProfileForWidget(userId),
      getWidgetStatistics(userId),
      getCalendarIntegrations(userId),
    ]);

    // Get availability for next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const availability = await getAvailabilityForDateRange(
      userId,
      startDate,
      endDate
    );

    // Track this widget view
    await trackWidgetEvent(userId, "view");

    return {
      settings,
      profile,
      stats,
      availability,
      hasCalendarIntegration: integrations.length > 0,
    };
  } catch (error) {
    console.error("Error getting widget data:", error);
    return {
      settings: getDefaultWidgetSettings(),
      profile: null,
      stats: {
        views: 0,
        clicks: 0,
        bookings: 0,
      },
      availability: [],
      hasCalendarIntegration: false,
    };
  }
};
