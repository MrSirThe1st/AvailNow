// // src/context/CalendarIntegrationContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useAuth } from "./SupabaseAuthContext";
// import { useSettings } from "./SettingsContext";
// import {
//   CALENDAR_PROVIDERS,
//   initiateCalendarAuth,
//   handleCalendarCallback,
//   getConnectedCalendars,
//   disconnectCalendar,
// } from "../lib/calendarService";

// const CalendarIntegrationContext = createContext();

// export function useCalendarIntegration() {
//   return useContext(CalendarIntegrationContext);
// }

// export function CalendarIntegrationProvider({ children }) {
//   const { user } = useAuth();
//   const { calendarSettings, setActiveCalendar } = useSettings();

//   const [connectedCalendars, setConnectedCalendars] = useState([]);
//   const [calendarsList, setCalendarsList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingAuth, setProcessingAuth] = useState(false);

//   // Load connected calendars
//   useEffect(() => {
//     const loadConnectedCalendars = async () => {
//       if (!user?.id) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Get calendar integrations from database
//         const { data: integrations, error: integrationsError } = await supabase
//           .from("calendar_integrations")
//           .select("*")
//           .eq("user_id", user.id);

//         if (integrationsError) {
//           console.error(
//             "Error fetching calendar integrations:",
//             integrationsError
//           );
//           throw new Error("Failed to fetch calendar integrations");
//         }

//         setConnectedCalendars(integrations || []);

//         // Get calendars list if we have integrations
//         if (integrations && integrations.length > 0) {
//           try {
//             const allCalendars = await getConnectedCalendars(user.id);
//             setCalendarsList(allCalendars);
//           } catch (err) {
//             console.error("Error fetching connected calendars:", err);
//           }
//         }
//       } catch (err) {
//         console.error("Error in CalendarIntegrationContext:", err);
//         setError("Failed to load calendar integrations");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadConnectedCalendars();

//     // Set up real-time subscription for calendar integration changes
//     if (user?.id) {
//       const subscription = supabase
//         .channel("calendar_integration_changes")
//         .on(
//           "postgres_changes",
//           {
//             event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
//             schema: "public",
//             table: "calendar_integrations",
//             filter: `user_id=eq.${user.id}`,
//           },
//           (payload) => {
//             // Refresh calendar integrations on changes
//             loadConnectedCalendars();
//           }
//         )
//         .subscribe();

//       return () => {
//         subscription.unsubscribe();
//       };
//     }
//   }, [user?.id]);

//   // Process OAuth callback
//   const processOAuthCallback = async (code, state, provider) => {
//     if (!user?.id || !code || !state || !provider) {
//       throw new Error("Missing required parameters for OAuth callback");
//     }

//     try {
//       setProcessingAuth(true);

//       const result = await handleCalendarCallback(
//         provider,
//         { code, state },
//         user.id
//       );

//       // If successful, reload connected calendars
//       await refreshCalendarData();

//       // Set this new provider as active if no active calendar is already set
//       if (!calendarSettings.active_calendar) {
//         await setActiveCalendar(provider);
//       }

//       return result;
//     } catch (err) {
//       console.error("Error processing OAuth callback:", err);
//       throw err;
//     } finally {
//       setProcessingAuth(false);
//     }
//   };

//   // Start OAuth flow
//   const connectCalendar = async (provider) => {
//     if (!user?.id) {
//       throw new Error("User must be logged in to connect a calendar");
//     }

//     if (!Object.values(CALENDAR_PROVIDERS).includes(provider)) {
//       throw new Error(`Unsupported calendar provider: ${provider}`);
//     }

//     try {
//       const authUrl = await initiateCalendarAuth(provider);
//       return authUrl;
//     } catch (err) {
//       console.error(`Error initiating ${provider} authorization:`, err);
//       throw err;
//     }
//   };

//   // Disconnect a calendar
//   const removeCalendarIntegration = async (provider) => {
//     if (!user?.id) {
//       throw new Error("User must be logged in to disconnect a calendar");
//     }

//     try {
//       await disconnectCalendar(user.id, provider);

//       // If this was the active calendar, clear the active calendar setting
//       if (calendarSettings.active_calendar === provider) {
//         await setActiveCalendar(null);
//       }

//       // Refresh the data
//       await refreshCalendarData();

//       return { success: true };
//     } catch (err) {
//       console.error(`Error disconnecting ${provider} calendar:`, err);
//       throw err;
//     }
//   };

//   // Refresh calendar data
//   const refreshCalendarData = async () => {
//     try {
//       setLoading(true);

//       // Get calendar integrations from database
//       const { data: integrations, error: integrationsError } = await supabase
//         .from("calendar_integrations")
//         .select("*")
//         .eq("user_id", user.id);

//       if (integrationsError) throw integrationsError;

//       setConnectedCalendars(integrations || []);

//       // Get calendars list if we have integrations
//       if (integrations && integrations.length > 0) {
//         const allCalendars = await getConnectedCalendars(user.id);
//         setCalendarsList(allCalendars);
//       } else {
//         setCalendarsList([]);
//       }

//       return { success: true };
//     } catch (err) {
//       console.error("Error refreshing calendar data:", err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get is provider connected
//   const isProviderConnected = (provider) => {
//     return connectedCalendars.some((cal) => cal.provider === provider);
//   };

//   // Check if a specific calendar is selected
//   const isCalendarSelected = (calendarId, provider) => {
//     if (!user?.id) return false;

//     const calendar = calendarsList.find(
//       (cal) => cal.id === calendarId && cal.provider === provider
//     );

//     return calendar ? calendar.selected : false;
//   };

//   const value = {
//     connectedCalendars,
//     calendarsList,
//     loading,
//     error,
//     processingAuth,
//     connectCalendar,
//     processOAuthCallback,
//     removeCalendarIntegration,
//     refreshCalendarData,
//     isProviderConnected,
//     isCalendarSelected,
//   };

//   return (
//     <CalendarIntegrationContext.Provider value={value}>
//       {children}
//     </CalendarIntegrationContext.Provider>
//   );
// }
