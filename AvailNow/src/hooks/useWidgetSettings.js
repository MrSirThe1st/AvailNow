import { useState, useEffect } from "react";
import {
  getWidgetSettings as fetchWidgetSettings,
  getDefaultWidgetSettings,
  saveWidgetSettings as saveSettings,
} from "../lib/widgetService";

/**
 * Custom hook to manage widget settings with real data from Supabase
 * @param {string} userId - User ID
 * @returns {Object} - Widget settings and methods to update them
 */
export const useWidgetSettings = (userId) => {
  const [settings, setSettings] = useState(getDefaultWidgetSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load settings from the database
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchWidgetSettings(userId);
        setSettings(data);
        setIsDirty(false);
      } catch (err) {
        console.error("Error loading widget settings:", err);
        setError("Failed to load widget settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  // Update a single setting
  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  // Update multiple settings at once
  const updateSettings = (updates) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
    setIsDirty(true);
  };

  // Reset settings to defaults
  const resetToDefaults = () => {
    setSettings(getDefaultWidgetSettings());
    setIsDirty(true);
  };

  // Save settings to the database
  const saveWidgetSettings = async () => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      // Ensure user_id is set
      const dataToSave = {
        ...settings,
        user_id: userId,
      };

      await saveSettings(userId, dataToSave);
      setIsDirty(false);
      return true;
    } catch (err) {
      console.error("Error saving widget settings:", err);
      setError("Failed to save widget settings");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    updateSetting,
    updateSettings,
    resetToDefaults,
    saveSettings: saveWidgetSettings,
    loading,
    error,
    isDirty,
  };
};

export default useWidgetSettings;
