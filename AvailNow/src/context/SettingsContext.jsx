// // src/context/SettingsContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useAuth } from "./SupabaseAuthContext";

// const SettingsContext = createContext();

// export function useSettings() {
//   return useContext(SettingsContext);
// }

// export function SettingsProvider({ children }) {
//   const { user } = useAuth();
//   const [widgetSettings, setWidgetSettings] = useState(null);
//   const [calendarSettings, setCalendarSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Load widget and calendar settings when user changes
//   useEffect(() => {
//     const loadSettings = async () => {
//       if (!user?.id) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         // Load widget settings
//         const { data: widgetData, error: widgetError } = await supabase
//           .from("widget_settings")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (widgetError && widgetError.code !== "PGRST116") {
//           console.error("Error loading widget settings:", widgetError);
//           setError("Failed to load widget settings");
//         } else {
//           setWidgetSettings(widgetData || getDefaultWidgetSettings());
//         }

//         // Load calendar settings
//         const { data: calendarData, error: calendarError } = await supabase
//           .from("calendar_settings")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (calendarError && calendarError.code !== "PGRST116") {
//           console.error("Error loading calendar settings:", calendarError);
//           setError("Failed to load calendar settings");
//         } else {
//           setCalendarSettings(calendarData || getDefaultCalendarSettings());
//         }
//       } catch (err) {
//         console.error("Error in settings context:", err);
//         setError("Failed to load settings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSettings();

//     // Set up real-time subscription for settings changes
//     if (user?.id) {
//       const widgetSubscription = supabase
//         .channel("widget_settings_changes")
//         .on(
//           "postgres_changes",
//           {
//             event: "UPDATE",
//             schema: "public",
//             table: "widget_settings",
//             filter: `user_id=eq.${user.id}`,
//           },
//           (payload) => {
//             setWidgetSettings(payload.new);
//           }
//         )
//         .subscribe();

//       const calendarSubscription = supabase
//         .channel("calendar_settings_changes")
//         .on(
//           "postgres_changes",
//           {
//             event: "UPDATE",
//             schema: "public",
//             table: "calendar_settings",
//             filter: `user_id=eq.${user.id}`,
//           },
//           (payload) => {
//             setCalendarSettings(payload.new);
//           }
//         )
//         .subscribe();

//       return () => {
//         widgetSubscription.unsubscribe();
//         calendarSubscription.unsubscribe();
//       };
//     }
//   }, [user?.id]);

//   // Default widget settings
//   const getDefaultWidgetSettings = () => {
//     return {
//       user_id: user?.id,
//       theme: "light",
//       accent_color: "#0070f3",
//       text_color: "#333333",
//       button_text: "Check Availability",
//       show_days: 5,
//       compact: false,
//       header_style: "modern",
//       font_family: "system",
//       border_radius: "medium",
//     };
//   };

//   // Default calendar settings
//   const getDefaultCalendarSettings = () => {
//     return {
//       user_id: user?.id,
//       timezone: "UTC",
//       availability_start_time: "09:00",
//       availability_end_time: "17:00",
//       working_days: [1, 2, 3, 4, 5],
//       buffer_before: 0,
//       buffer_after: 0,
//       active_calendar: null,
//     };
//   };

//   // Save widget settings
//   const saveWidgetSettings = async (settings) => {
//     if (!user?.id) return { error: "No user logged in" };

//     try {
//       const dataToSave = {
//         ...settings,
//         user_id: user.id,
//         updated_at: new Date().toISOString(),
//       };

//       const { data, error } = await supabase
//         .from("widget_settings")
//         .upsert(dataToSave)
//         .select()
//         .single();

//       if (error) throw error;

//       setWidgetSettings(data);
//       return { data, error: null };
//     } catch (err) {
//       console.error("Error saving widget settings:", err);
//       return { data: null, error: err };
//     }
//   };

//   // Save calendar settings
//   const saveCalendarSettings = async (settings) => {
//     if (!user?.id) return { error: "No user logged in" };

//     try {
//       const dataToSave = {
//         ...settings,
//         user_id: user.id,
//         updated_at: new Date().toISOString(),
//       };

//       const { data, error } = await supabase
//         .from("calendar_settings")
//         .upsert(dataToSave)
//         .select()
//         .single();

//       if (error) throw error;

//       setCalendarSettings(data);
//       return { data, error: null };
//     } catch (err) {
//       console.error("Error saving calendar settings:", err);
//       return { data: null, error: err };
//     }
//   };

//   // Set active calendar provider
//   const setActiveCalendar = async (provider) => {
//     try {
//       // Update state immediately for better UX
//       setCalendarSettings((prev) => ({
//         ...prev,
//         active_calendar: provider,
//       }));

//       // Save to database
//       const result = await saveCalendarSettings({
//         ...calendarSettings,
//         active_calendar: provider,
//       });

//       return result;
//     } catch (err) {
//       console.error("Error setting active calendar:", err);
//       // Revert state if save fails
//       setCalendarSettings((prev) => ({
//         ...prev,
//         active_calendar: calendarSettings.active_calendar,
//       }));
//       return { error: err };
//     }
//   };

//   // Reset to default settings
//   const resetToDefaults = async () => {
//     if (!user?.id) return { error: "No user logged in" };

//     try {
//       const defaultWidgetSettings = getDefaultWidgetSettings();
//       const defaultCalendarSettings = getDefaultCalendarSettings();

//       await Promise.all([
//         saveWidgetSettings(defaultWidgetSettings),
//         saveCalendarSettings(defaultCalendarSettings),
//       ]);

//       return { success: true, error: null };
//     } catch (err) {
//       console.error("Error resetting to defaults:", err);
//       return { success: false, error: err };
//     }
//   };

//   const value = {
//     widgetSettings,
//     calendarSettings,
//     saveWidgetSettings,
//     saveCalendarSettings,
//     setActiveCalendar,
//     resetToDefaults,
//     loading,
//     error,
//   };

//   return (
//     <SettingsContext.Provider value={value}>
//       {children}
//     </SettingsContext.Provider>
//   );
// }