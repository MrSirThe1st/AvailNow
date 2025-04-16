/**
 * Widget Service - Provides methods for widget management and customization
 * This service handles widget settings, customization, and generating embed codes
 */

import { supabase } from "./supabase";

/**
 * Get widget settings for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Widget settings
 */
export const getWidgetSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("widget_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
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
 * Generate widget embed code for a user
 * @param {string} userId - Supabase or Clerk user ID
 * @param {Object} settings - Widget settings
 * @returns {string} - HTML embed code
 */
export const generateWidgetEmbedCode = (userId, settings) => {
  const settingsJson = JSON.stringify({
    userId,
    theme: settings.theme,
    accentColor: settings.accentColor,
    textColor: settings.textColor,
    buttonText: settings.buttonText,
    showDays: settings.showDays,
    compact: settings.compact,
  });

  return `<!-- AvailNow Widget -->
<div id="availnow-widget"></div>
<script src="https://widget.availnow.com/embed.js"></script>
<script>
  AvailNow.initialize({
    selector: "#availnow-widget",
    userId: "${userId}",
    theme: "${settings.theme}",
    accentColor: "${settings.accentColor}",
    textColor: "${settings.textColor}",
    buttonText: "${settings.buttonText}",
    showDays: ${settings.showDays},
    compact: ${settings.compact}
  });
</script>
<!-- End AvailNow Widget -->`;
};

/**
 * Get widget statistics for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Widget usage statistics
 */
export const getWidgetStatistics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("widget_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
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
  try {
    // In a real implementation, you would increment the appropriate counter
    // For now, we'll just log the event
    console.log(`Tracked widget event: ${eventType} for user ${userId}`);

    // This would be the actual implementation:
    /*
    const { data: stats } = await supabase
      .from('widget_stats')
      .select('id, views, clicks, bookings')
      .eq('user_id', userId)
      .single();
    
    if (stats) {
      // Update existing stats
      const updates = {
        last_updated: new Date().toISOString()
      };
      
      if (eventType === 'view') updates.views = stats.views + 1;
      if (eventType === 'click') updates.clicks = stats.clicks + 1;
      if (eventType === 'booking') updates.bookings = stats.bookings + 1;
      
      await supabase
        .from('widget_stats')
        .update(updates)
        .eq('id', stats.id);
    } else {
      // Create new stats record
      const newStats = {
        user_id: userId,
        views: eventType === 'view' ? 1 : 0,
        clicks: eventType === 'click' ? 1 : 0,
        bookings: eventType === 'booking' ? 1 : 0,
        last_updated: new Date().toISOString()
      };
      
      await supabase
        .from('widget_stats')
        .insert(newStats);
    }
    */
  } catch (error) {
    console.error("Error tracking widget event:", error);
  }
};

/**
 * Save widget settings for a user
 * @param {string} userId - Supabase user ID
 * @param {Object} settings - Widget settings to save
 * @returns {Promise<Object>} - Updated widget settings
 */
export const saveWidgetSettings = async (userId, settings) => {
  try {
    // Check if settings already exist for this user
    const { data: existingSettings } = await supabase
      .from("widget_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("widget_settings")
        .update(settings)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from("widget_settings")
        .insert({
          user_id: userId,
          ...settings,
        })
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
