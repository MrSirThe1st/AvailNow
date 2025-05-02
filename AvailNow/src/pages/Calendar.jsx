// src/pages/Calendar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Loader, AlertTriangle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CalendarView from "../components/calendar/CalendarView";
import CalendarIntegration from "../components/calendar/CalendarIntegration";
import {
  handleCalendarCallback,
  CALENDAR_PROVIDERS,
} from "../lib/calendarService";
import { useAuth } from "../context/SupabaseAuthContext";
import { supabase } from "../lib/supabase";
import authService from "../lib/authService";

const Calendar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [calendarSettings, setCalendarSettings] = useState(null);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [calendarsList, setCalendarsList] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callbackProcessing, setCallbackProcessing] = useState(false);
  const [callbackError, setCallbackError] = useState(null);

  // Attempt to restore session if needed
  useEffect(() => {
    // Restore auth session if needed
    const restoreSession = async () => {
      if (!user) {
        const restored = await authService.restoreAuthState();
        if (restored) {
          console.log("Successfully restored auth session");
        }
      }
    };

    restoreSession();
  }, [user]);

  // Process OAuth callback if present in URL
  useEffect(() => {
    const processOAuthCallback = async () => {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      // Get provider from localStorage
      const provider = localStorage.getItem("calendarAuthProvider");

      // Only process if we have all required parameters
      if (code && state && provider && user?.id) {
        setCallbackProcessing(true);

        // Clean URL parameters to prevent reprocessing
        navigate("/calendar", { replace: true });

        try {
          console.log(`Processing ${provider} OAuth callback...`);

          // Process the callback
          const result = await handleCalendarCallback(
            provider,
            { code, state },
            user.id
          );

          console.log("OAuth callback successful:", result);

          // Update connected calendars state
          if (result && result.calendars) {
            // Add the integration to connected calendars
            const newIntegration = {
              id: `${provider}-integration-${Date.now()}`,
              provider: provider,
              user_id: user.id,
              created_at: new Date().toISOString(),
              calendar_id: "primary",
            };

            setConnectedCalendars((prev) => {
              // Avoid duplicates
              if (!prev.some((cal) => cal.provider === provider)) {
                return [...prev, newIntegration];
              }
              return prev;
            });

            // Add calendars to the list
            setCalendarsList((prev) => {
              const existingIds = prev.map((cal) => cal.id);
              const newCals = result.calendars
                .filter((cal) => !existingIds.includes(cal.id))
                .map((cal) => ({
                  ...cal,
                  selected: true,
                }));
              return [...prev, ...newCals];
            });
          }

          setCallbackError(null);
        } catch (err) {
          console.error("Error processing OAuth callback:", err);
          setCallbackError(
            "Failed to connect calendar: " + (err.message || "Unknown error")
          );
        } finally {
          setCallbackProcessing(false);

          // Clean up
          localStorage.removeItem("calendarAuthProvider");
        }
      }
    };

    processOAuthCallback();
  }, [user, navigate]);

  // Load connected calendars on mount
  useEffect(() => {
    if (user) {
      loadConnectedCalendars();
    }
  }, [user]);

  // Load connected calendars
  const loadConnectedCalendars = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading connected calendars");

      if (user?.id) {
        const { data: userIntegrations, error: userError } = await supabase
          .from("calendar_integrations")
          .select("*")
          .eq("user_id", user.id);

        if (userError) {
          console.error("Error fetching user integrations:", userError);
        } else {
          console.log("User's calendar integrations:", userIntegrations || []);

          // Check if we have integrations
          if (userIntegrations && userIntegrations.length > 0) {
            setConnectedCalendars(userIntegrations);

            // For each calendar, fetch the calendar list
            const calendarsByProvider = {};

            for (const integration of userIntegrations) {
              try {
                const calendarsForProvider = await fetchCalendarsForProvider(
                  user.id,
                  integration.provider
                );
                calendarsByProvider[integration.provider] =
                  calendarsForProvider;
              } catch (err) {
                console.error(
                  `Error fetching calendars for ${integration.provider}:`,
                  err
                );
              }
            }

            // Flatten and store all calendars
            const allCalendars = Object.values(calendarsByProvider).flat();
            if (allCalendars.length > 0) {
              setCalendarsList(allCalendars);
            }
          } else {
            console.log("No connected calendars found in database");
            setConnectedCalendars([]);
          }
        }
      }
    } catch (err) {
      console.error("Error loading connected calendars:", err);
      setError("Failed to load calendar integrations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder function to fetch calendars for a specific provider
  const fetchCalendarsForProvider = async (userId, provider) => {
    // In a real implementation, you would call your calendar service here
    // For now, return mock data
    if (provider === CALENDAR_PROVIDERS.GOOGLE) {
      return [
        {
          id: "google-primary",
          name: "Primary Calendar",
          provider: "google",
          primary: true,
        },
      ];
    } else if (provider === CALENDAR_PROVIDERS.OUTLOOK) {
      return [
        {
          id: "outlook-primary",
          name: "Outlook Calendar",
          provider: "outlook",
          primary: true,
        },
      ];
    }
    return [];
  };

  // Handle adding new calendar integration
  const handleAddCalendar = async (newCalendars) => {
    try {
      console.log("Adding new calendars:", newCalendars);

      // Store the actual calendar data
      if (newCalendars && newCalendars.length > 0) {
        setCalendarsList((prevCalendars) => {
          // Merge with existing calendars, avoiding duplicates by ID
          const existingIds = prevCalendars.map((cal) => cal.id);
          const newUniqueCals = newCalendars.filter(
            (cal) => !existingIds.includes(cal.id)
          );
          return [...prevCalendars, ...newUniqueCals];
        });

        // Get the provider from the first calendar
        const provider = newCalendars[0].provider;

        // Check if we already have this provider's integration
        const hasProvider = connectedCalendars.some(
          (cal) => cal.provider === provider
        );

        if (!hasProvider) {
          // Create integration object based on the provider
          const newIntegration = {
            id: `${provider}-integration-${Date.now()}`,
            provider: provider,
            user_id: user.id,
            created_at: new Date().toISOString(),
            access_token: "present",
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          };

          setConnectedCalendars((prev) => [...prev, newIntegration]);
        }
      }

      setShowCalendarModal(false);
    } catch (err) {
      console.error("Error handling new calendar:", err);
      setError("Failed to add calendar integration.");
    }
  };

  // If user is not authenticated, show loading or redirect
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading user session...</p>
      </div>
    );
  }

  return (
    <div>
      {/* OAuth Callback Status */}
      {callbackProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Loader size={24} className="animate-spin mr-3 text-blue-500" />
            <p>Processing calendar connection...</p>
          </div>
        </div>
      )}

      {callbackError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertTriangle
              size={24}
              className="mr-3 text-red-500 flex-shrink-0"
            />
            <div>
              <p className="text-red-700 font-medium">Connection Error</p>
              <p className="text-red-600">{callbackError}</p>
              <button
                className="mt-2 text-sm text-blue-600 underline"
                onClick={() => setCallbackError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Calendars Display */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Calendar Status */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-bold mb-2">Google Calendar:</h3>
          <p>
            Status:{" "}
            {connectedCalendars.some((cal) => cal.provider === "google")
              ? "✅ Connected"
              : "❌ Not connected"}
          </p>
          {!connectedCalendars.some((cal) => cal.provider === "google") && (
            <button
              onClick={() => {
                setShowCalendarModal(true);
                // You could pre-select Google here if you want
              }}
              className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
            >
              Connect Google Calendar
            </button>
          )}
        </div>

        {/* Outlook Calendar Status */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
          <h3 className="font-bold mb-2">Microsoft Outlook:</h3>
          <p>
            Status:{" "}
            {connectedCalendars.some((cal) => cal.provider === "outlook")
              ? "✅ Connected"
              : "❌ Not connected"}
          </p>
          {!connectedCalendars.some((cal) => cal.provider === "outlook") && (
            <button
              onClick={() => {
                setShowCalendarModal(true);
                // You could pre-select Outlook here if you want
              }}
              className="mt-2 bg-indigo-500 text-white px-4 py-1 rounded"
            >
              Connect Outlook Calendar
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Calendar View Component */}
      <CalendarView
        connectedCalendars={connectedCalendars}
        calendarsList={calendarsList}
        onAddCalendar={() => setShowCalendarModal(true)}
        user={user}
      />

      {/* Calendar Integration Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <CalendarIntegration
              onClose={() => setShowCalendarModal(false)}
              onSuccess={handleAddCalendar}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
