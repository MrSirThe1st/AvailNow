/**
 * Widget Service - Provides methods for widget management and customization
 * This service handles widget settings, customization, and generating embed codes
 */

import {
  getDocumentsByField,
  createDocument,
  updateDocument,
  COLLECTIONS,
} from "./collections";

/**
 * Get widget settings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Widget settings
 */
export const getWidgetSettings = async (userId) => {
  try {
    const settings = await getDocumentsByField(
      COLLECTIONS.WIDGET_SETTINGS,
      "user_id",
      userId
    );

    if (settings && settings.length > 0) {
      return settings[0];
    }

    return getDefaultWidgetSettings();
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
 * @param {string} userId - User ID
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
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Widget usage statistics
 */
export const getWidgetStatistics = async (userId) => {
  try {
    const stats = await getDocumentsByField(
      COLLECTIONS.WIDGET_STATS,
      "user_id",
      userId
    );

    if (stats && stats.length > 0) {
      return stats[0];
    }

    return {
      views: 0,
      clicks: 0,
      bookings: 0,
      last_updated: new Date().toISOString(),
    };
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
 * @param {string} userId - User ID
 * @param {string} eventType - Type of event ('view', 'click', 'booking')
 * @returns {Promise<void>}
 */
export const trackWidgetEvent = async (userId, eventType) => {
  try {
    // In a real implementation, you would increment the appropriate counter
    // For now, we'll just log the event
    console.log(`Tracked widget event: ${eventType} for user ${userId}`);

    // Get existing stats
    const stats = await getDocumentsByField(
      COLLECTIONS.WIDGET_STATS,
      "user_id",
      userId
    );

    if (stats && stats.length > 0) {
      // Update existing stats
      const statDoc = stats[0];
      const updates = {
        last_updated: new Date().toISOString(),
      };

      if (eventType === "view") updates.views = (statDoc.views || 0) + 1;
      if (eventType === "click") updates.clicks = (statDoc.clicks || 0) + 1;
      if (eventType === "booking")
        updates.bookings = (statDoc.bookings || 0) + 1;

      await updateDocument(COLLECTIONS.WIDGET_STATS, statDoc.id, updates);
    } else {
      // Create new stats record
      const newStats = {
        user_id: userId,
        views: eventType === "view" ? 1 : 0,
        clicks: eventType === "click" ? 1 : 0,
        bookings: eventType === "booking" ? 1 : 0,
        last_updated: new Date().toISOString(),
      };

      await createDocument(COLLECTIONS.WIDGET_STATS, null, newStats);
    }
  } catch (error) {
    console.error("Error tracking widget event:", error);
  }
};

/**
 * Save widget settings for a user
 * @param {string} userId - User ID
 * @param {Object} settings - Widget settings to save
 * @returns {Promise<Object>} - Updated widget settings
 */
export const saveWidgetSettings = async (userId, settings) => {
  try {
    // Check if settings already exist for this user
    const existingSettings = await getDocumentsByField(
      COLLECTIONS.WIDGET_SETTINGS,
      "user_id",
      userId
    );

    let result;

    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      result = await updateDocument(
        COLLECTIONS.WIDGET_SETTINGS,
        existingSettings[0].id,
        settings
      );
    } else {
      // Insert new settings
      result = await createDocument(COLLECTIONS.WIDGET_SETTINGS, null, {
        user_id: userId,
        ...settings,
      });
    }

    return result;
  } catch (error) {
    console.error("Error saving widget settings:", error);
    throw error;
  }
};
