import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./SupabaseAuthContext";

// Create the context
const CalendarContext = createContext(null);

// Create the provider component
export function CalendarProvider({ children }) {
  const { user } = useAuth();
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load active calendar preference from database
  const loadActiveCalendar = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("calendar_settings")
        .select("active_calendar")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading active calendar:", error);
        return;
      }

      if (data?.active_calendar) {
        console.log("Loaded active calendar from DB:", data.active_calendar);
        setActiveCalendar(data.active_calendar);
      }
    } catch (err) {
      console.error("Error in loadActiveCalendar:", err);
    }
  };

  // Load connected calendars
  const loadConnectedCalendars = async () => {
    if (!user?.id) return;

    try {
      const { data: userIntegrations, error: userError } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", user.id);

      if (userError) {
        console.error("Error fetching user integrations:", userError);
      } else {
        console.log("Loaded connected calendars:", userIntegrations || []);
        setConnectedCalendars(userIntegrations || []);
      }
    } catch (err) {
      console.error("Error loading connected calendars:", err);
    }
  };

  // Save active calendar preference
  const saveActiveCalendar = async (provider) => {
    if (!user?.id) return;

    try {
      // First check if a record exists
      const { data: existing } = await supabase
        .from("calendar_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("calendar_settings")
          .update({
            active_calendar: provider,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating active calendar:", error);
          throw error;
        }
      } else {
        // Insert new record
        const { error } = await supabase.from("calendar_settings").insert({
          user_id: user.id,
          active_calendar: provider,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error inserting active calendar:", error);
          throw error;
        }
      }

      console.log("Saved active calendar:", provider);
    } catch (err) {
      console.error("Error in saveActiveCalendar:", err);
      throw err;
    }
  };

  // Toggle calendar function
  const toggleCalendar = async (provider) => {
    if (!user?.id) return;

    const newActiveCalendar = activeCalendar === provider ? null : provider;

    try {
      // Update local state immediately for better UX
      setActiveCalendar(newActiveCalendar);

      // Save to database
      await saveActiveCalendar(newActiveCalendar);
    } catch (err) {
      // Revert local state if save fails
      setActiveCalendar(activeCalendar);
      setError("Failed to save calendar preference");
    }
  };

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([loadConnectedCalendars(), loadActiveCalendar()]);
      } catch (err) {
        console.error("Error loading calendar data:", err);
        setError("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Value to be provided to consumers
  const value = {
    activeCalendar,
    connectedCalendars,
    loading,
    error,
    toggleCalendar,
    setConnectedCalendars,
    reloadCalendarData: async () => {
      await Promise.all([loadConnectedCalendars(), loadActiveCalendar()]);
    },
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

// Custom hook to use the calendar context
export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
