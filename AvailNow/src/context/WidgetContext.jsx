// // src/context/WidgetContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";
// import { useAuth } from "./SupabaseAuthContext";
// import { useSettings } from "./SettingsContext";
// import { trackWidgetEvent } from "../lib/widgetService";

// const WidgetContext = createContext();

// export function useWidget() {
//   return useContext(WidgetContext);
// }

// export function WidgetProvider({ children }) {
//   const { user } = useAuth();
//   const { widgetSettings } = useSettings();

//   const [widgetStats, setWidgetStats] = useState({
//     views: 0,
//     clicks: 0,
//     bookings: 0,
//     last_updated: null,
//   });

//   const [embedCode, setEmbedCode] = useState("");
//   const [standalonePageUrl, setStandalonePageUrl] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Load widget statistics
//   useEffect(() => {
//     const loadWidgetStats = async () => {
//       if (!user?.id) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Get widget stats from database
//         const { data: stats, error: statsError } = await supabase
//           .from("widget_stats")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (statsError && statsError.code !== "PGRST116") {
//           console.error("Error fetching widget stats:", statsError);
//           throw new Error("Failed to fetch widget statistics");
//         }

//         // Set stats or defaults
//         setWidgetStats(
//           stats || {
//             views: 0,
//             clicks: 0,
//             bookings: 0,
//             last_updated: new Date().toISOString(),
//           }
//         );

//         // Generate embed code
//         generateEmbedCode();

//         // Generate standalone page URL
//         setStandalonePageUrl(`https://${user.id}.availnow.com`);
//       } catch (err) {
//         console.error("Error in WidgetContext:", err);
//         setError("Failed to load widget data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadWidgetStats();

//     // Set up real-time subscription for widget stats
//     if (user?.id) {
//       const subscription = supabase
//         .channel("widget_stats_changes")
//         .on(
//           "postgres_changes",
//           {
//             event: "UPDATE",
//             schema: "public",
//             table: "widget_stats",
//             filter: `user_id=eq.${user.id}`,
//           },
//           (payload) => {
//             setWidgetStats(payload.new);
//           }
//         )
//         .subscribe();

//       return () => {
//         subscription.unsubscribe();
//       };
//     }
//   }, [user?.id, widgetSettings]);

//   // Generate embed code based on settings
//   const generateEmbedCode = () => {
//     if (!user?.id || !widgetSettings) return "";

//     const code = `<!-- AvailNow Widget -->
// <div id="availnow-widget"></div>
// <script src="https://widget.availnow.com/embed.js"></script>
// <script>
//   AvailNow.initialize({
//     selector: "#availnow-widget",
//     userId: "${user.id}",
//     theme: "${widgetSettings.theme || "light"}",
//     accentColor: "${widgetSettings.accent_color || "#0070f3"}",
//     textColor: "${widgetSettings.text_color || "#333333"}",
//     buttonText: "${widgetSettings.button_text || "Check Availability"}",
//     showDays: ${widgetSettings.show_days || 5},
//     compact: ${widgetSettings.compact || false}
//   });
// </script>
// <!-- End AvailNow Widget -->`;

//     setEmbedCode(code);
//     return code;
//   };

//   // Generate iframe code
//   const generateIframeCode = (height = "500px") => {
//     if (!user?.id) return "";

//     return `<iframe src="https://${user.id}.availnow.com" width="100%" height="${height}" frameborder="0"></iframe>`;
//   };

//   // Track widget event
//   const trackEvent = async (eventType) => {
//     if (!user?.id) return;

//     try {
//       await trackWidgetEvent(user.id, eventType);

//       // Update local state to show changes immediately
//       setWidgetStats((prev) => ({
//         ...prev,
//         [eventType === "view"
//           ? "views"
//           : eventType === "click"
//             ? "clicks"
//             : "bookings"]:
//           (prev[
//             eventType === "view"
//               ? "views"
//               : eventType === "click"
//                 ? "clicks"
//                 : "bookings"
//           ] || 0) + 1,
//         last_updated: new Date().toISOString(),
//       }));
//     } catch (err) {
//       console.error("Error tracking widget event:", err);
//     }
//   };

//   const value = {
//     widgetStats,
//     embedCode,
//     standalonePageUrl,
//     loading,
//     error,
//     generateEmbedCode,
//     generateIframeCode,
//     trackEvent,
//   };

//   return (
//     <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>
//   );
// }
