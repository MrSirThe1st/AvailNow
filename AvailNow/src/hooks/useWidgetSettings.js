import { useState, useEffect } from "react";
import {
  getWidgetSettings,
  saveWidgetSettings,
  getDefaultWidgetSettings,
} from "../lib/widgetService";

/**
 * Custom hook to manage widget settings
 * @param {string} userId - User ID
 * @returns {Object} - Widget settings and methods to update them
 */
export const useWidgetSettings = (userId) => {
  const [settings, setSettings] = useState(getDefaultWidgetSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const data = await getWidgetSettings(userId);
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

  // Save settings to Firebase
  const saveSettings = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      await saveWidgetSettings(userId, settings);
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
    saveSettings,
    loading,
    error,
    isDirty,
  };
};

export default useWidgetSettings;
