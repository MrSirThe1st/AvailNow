/**
 * API Client for AvailNow
 * Handles all API communication with the backend services
 */

import { supabase } from "./supabase";

/**
 * Base API URL for external API calls
 * In production, this would point to your actual API endpoint
 */
const API_BASE_URL = "https://api.availnow.com/v1";

/**
 * Generic error handler for API requests
 * @param {Error} error - Error object
 * @param {string} customMessage - Custom error message
 * @returns {Error} - Enhanced error object
 */
const handleApiError = (error, customMessage) => {
  console.error(`API Error: ${customMessage}`, error);
  const enhancedError = new Error(customMessage || error.message);
  enhancedError.originalError = error;
  return enhancedError;
};

/**
 * Availability API methods
 */
export const AvailabilityAPI = {
  /**
   * Get availability slots for a user
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} - Availability slots
   */
  getAvailabilitySlots: async (userId, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("user_id", userId)
        .gte("start_time", startDate.toISOString())
        .lte("end_time", endDate.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, "Failed to fetch availability slots");
    }
  },

  /**
   * Create a new availability slot
   * @param {Object} slot - Availability slot data
   * @returns {Promise<Object>} - Created availability slot
   */
  createSlot: async (slot) => {
    try {
      if (!slot.user_id) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase
        .from("availability_slots")
        .insert([
          {
            ...slot,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, "Failed to create availability slot");
    }
  },

  /**
   * Update an availability slot
   * @param {string} slotId - Slot ID
   * @param {Object} updates - Updates to apply
   * @param {string} userId - User ID (for validation)
   * @returns {Promise<Object>} - Updated availability slot
   */
  updateSlot: async (slotId, updates, userId) => {
    try {
      const { data, error } = await supabase
        .from("availability_slots")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", slotId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, "Failed to update availability slot");
    }
  },

  /**
   * Delete an availability slot
   * @param {string} slotId - Slot ID
   * @param {string} userId - User ID (for validation)
   * @returns {Promise<void>}
   */
  deleteSlot: async (slotId, userId) => {
    try {
      const { error } = await supabase
        .from("availability_slots")
        .delete()
        .eq("id", slotId)
        .eq("user_id", userId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, "Failed to delete availability slot");
    }
  },

  /**
   * Toggle availability status for a slot
   * @param {string} slotId - Slot ID
   * @param {boolean} available - New availability status
   * @param {string} userId - User ID (for validation)
   * @returns {Promise<Object>} - Updated availability slot
   */
  toggleAvailability: async (slotId, available, userId) => {
    try {
      const { data, error } = await supabase
        .from("availability_slots")
        .update({
          available,
          updated_at: new Date().toISOString(),
        })
        .eq("id", slotId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, "Failed to toggle availability");
    }
  },
};

/**
 * Calendar API methods
 */
export const CalendarAPI = {
  /**
   * Get connected calendar integrations for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Calendar integrations
   */
  getCalendarIntegrations: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, "Failed to fetch calendar integrations");
    }
  },

  /**
   * Get calendar settings for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Calendar settings
   */
  getCalendarSettings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("calendar_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the "not found" error code
        throw error;
      }

      return (
        data || {
          user_id: userId,
          timezone: "UTC",
          availability_start_time: "09:00",
          availability_end_time: "17:00",
          working_days: [1, 2, 3, 4, 5], // Monday-Friday
          buffer_before: 0,
          buffer_after: 0,
        }
      );
    } catch (error) {
      throw handleApiError(error, "Failed to fetch calendar settings");
    }
  },

  /**
   * Update calendar settings
   * @param {string} userId - User ID
   * @param {Object} settings - Calendar settings
   * @returns {Promise<Object>} - Updated calendar settings
   */
  updateCalendarSettings: async (userId, settings) => {
    try {
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from("calendar_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from("calendar_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from("calendar_settings")
          .insert([
            {
              ...settings,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      throw handleApiError(error, "Failed to update calendar settings");
    }
  },
};

/**
 * Widget API methods
 */
export const WidgetAPI = {
  /**
   * Get widget settings for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Widget settings
   */
  getWidgetSettings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("widget_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

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
      throw handleApiError(error, "Failed to fetch widget settings");
    }
  },

  /**
   * Update widget settings
   * @param {string} userId - User ID
   * @param {Object} settings - Widget settings
   * @returns {Promise<Object>} - Updated widget settings
   */
  updateWidgetSettings: async (userId, settings) => {
    try {
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from("widget_settings")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from("widget_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from("widget_settings")
          .insert([
            {
              ...settings,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      throw handleApiError(error, "Failed to update widget settings");
    }
  },

  /**
   * Get widget statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Widget statistics
   */
  getWidgetStatistics: async (userId) => {
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
          user_id: userId,
          views: 0,
          clicks: 0,
          bookings: 0,
          last_updated: new Date().toISOString(),
        }
      );
    } catch (error) {
      throw handleApiError(error, "Failed to fetch widget statistics");
    }
  },

  /**
   * Track a widget event (view, click, booking)
   * @param {string} userId - User ID
   * @param {string} eventType - Event type (view, click, booking)
   * @returns {Promise<Object>} - Updated widget statistics
   */
  trackWidgetEvent: async (userId, eventType) => {
    try {
      // Get current stats
      const { data: existingStats } = await supabase
        .from("widget_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      const now = new Date().toISOString();

      if (existingStats) {
        // Update existing stats
        const updates = {
          last_updated: now,
        };

        if (eventType === "view") {
          updates.views = (existingStats.views || 0) + 1;
        } else if (eventType === "click") {
          updates.clicks = (existingStats.clicks || 0) + 1;
        } else if (eventType === "booking") {
          updates.bookings = (existingStats.bookings || 0) + 1;
        }

        const { data, error } = await supabase
          .from("widget_stats")
          .update(updates)
          .eq("id", existingStats.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new stats
        const newStats = {
          user_id: userId,
          views: eventType === "view" ? 1 : 0,
          clicks: eventType === "click" ? 1 : 0,
          bookings: eventType === "booking" ? 1 : 0,
          last_updated: now,
        };

        const { data, error } = await supabase
          .from("widget_stats")
          .insert([newStats])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      // For analytics, we don't want to throw errors
      console.error("Failed to track widget event:", error);
      return null;
    }
  },
};

/**
 * User API methods
 */
export const UserAPI = {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      throw handleApiError(error, "Failed to fetch user profile");
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profile - Profile data
   * @returns {Promise<Object>} - Updated user profile
   */
  updateUserProfile: async (userId, profile) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from("user_profiles")
          .update({
            ...profile,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from("user_profiles")
          .insert([
            {
              ...profile,
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      throw handleApiError(error, "Failed to update user profile");
    }
  },
};

// Default export for all API methods
export default {
  Availability: AvailabilityAPI,
  Calendar: CalendarAPI,
  Widget: WidgetAPI,
  User: UserAPI,
};
