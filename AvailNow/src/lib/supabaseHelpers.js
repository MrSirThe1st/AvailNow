// src/lib/supabaseHelpers.js
import { supabase } from "./supabase";

/**
 * Get user profile data including avatar URL and preferences
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object|null>} - User profile data or null if not found
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Create or update a user profile
 * @param {Object} profile - Profile data with user_id field
 * @returns {Promise<Object>} - Updated profile data
 */
export async function upsertUserProfile(profile) {
  if (!profile || !profile.user_id) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error upserting user profile:", error);
    throw error;
  }
}

/**
 * Get widget settings for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Widget settings
 */
export async function getWidgetSettings(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("widget_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows found"
      throw error;
    }

    // Return data or default settings
    return (
      data || {
        user_id: userId,
        theme: "light",
        accent_color: "#0070f3",
        text_color: "#333333",
        button_text: "Check Availability",
        show_days: 5,
        compact: false,
        header_style: "modern",
        font_family: "system",
        border_radius: "medium",
      }
    );
  } catch (error) {
    console.error("Error fetching widget settings:", error);
    throw error;
  }
}

/**
 * Save widget settings for a user
 * @param {string} userId - Supabase user ID
 * @param {Object} settings - Widget settings
 * @returns {Promise<Object>} - Updated widget settings
 */
export async function saveWidgetSettings(userId, settings) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("widget_settings")
      .upsert({
        ...settings,
        user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving widget settings:", error);
    throw error;
  }
}

/**
 * Get calendar settings for a user
 * @param {string} userId - Supabase user ID
 * @returns {Promise<Object>} - Calendar settings
 */
export async function getCalendarSettings(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows found"
      throw error;
    }

    // Return data or default settings
    return (
      data || {
        user_id: userId,
        timezone: "UTC",
        availability_start_time: "09:00",
        availability_end_time: "17:00",
        working_days: [1, 2, 3, 4, 5],
        buffer_before: 0,
        buffer_after: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching calendar settings:", error);
    throw error;
  }
}

/**
 * Save calendar settings for a user
 * @param {string} userId - Supabase user ID
 * @param {Object} settings - Calendar settings
 * @returns {Promise<Object>} - Updated calendar settings
 */
export async function saveCalendarSettings(userId, settings) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("calendar_settings")
      .upsert({
        ...settings,
        user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving calendar settings:", error);
    throw error;
  }
}

/**
 * Get availability slots for a user between two dates
 * @param {string} userId - Supabase user ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Availability slots
 */
export async function getAvailabilitySlots(userId, startDate, endDate) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("user_id", userId)
      .gte("start_time", startDate.toISOString())
      .lte("end_time", endDate.toISOString())
      .order("start_time");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching availability slots:", error);
    throw error;
  }
}

/**
 * Create or update an availability slot
 * @param {Object} slot - Availability slot data
 * @returns {Promise<Object>} - Updated availability slot data
 */
export async function upsertAvailabilitySlot(slot) {
  if (!slot || !slot.user_id) {
    throw new Error("User ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("availability_slots")
      .upsert({
        ...slot,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error upserting availability slot:", error);
    throw error;
  }
}

/**
 * Delete an availability slot
 * @param {string} slotId - Availability slot ID
 * @returns {Promise<void>}
 */
export async function deleteAvailabilitySlot(slotId) {
  if (!slotId) {
    throw new Error("Slot ID is required");
  }

  try {
    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", slotId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    throw error;
  }
}

/**
 * Track a widget event (view, click, booking)
 * @param {string} userId - User ID
 * @param {string} eventType - Event type ('view', 'click', 'booking')
 * @returns {Promise<void>}
 */
export async function trackWidgetEvent(userId, eventType) {
  if (!userId || !eventType) {
    return; // Silently fail for widget tracking
  }

  try {
    // First get current stats
    const { data: stats } = await supabase
      .from("widget_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (stats) {
      // Update existing stats
      const updates = {
        last_updated: new Date().toISOString(),
      };

      if (eventType === "view") updates.views = (stats.views || 0) + 1;
      if (eventType === "click") updates.clicks = (stats.clicks || 0) + 1;
      if (eventType === "booking") updates.bookings = (stats.bookings || 0) + 1;

      await supabase.from("widget_stats").update(updates).eq("id", stats.id);
    } else {
      // Create new stats record
      const newStats = {
        user_id: userId,
        views: eventType === "view" ? 1 : 0,
        clicks: eventType === "click" ? 1 : 0,
        bookings: eventType === "booking" ? 1 : 0,
        last_updated: new Date().toISOString(),
      };

      await supabase.from("widget_stats").insert(newStats);
    }
  } catch (error) {
    console.error("Error tracking widget event:", error);
    // Don't throw - widget tracking should fail silently
  }
}
