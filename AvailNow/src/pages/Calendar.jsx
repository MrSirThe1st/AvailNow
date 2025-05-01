// src/pages/Calendar.jsx
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { useLocation } from "react-router-dom";
import CalendarView from "../components/calendar/CalendarView";
import CalendarIntegration from "../components/calendar/CalendarIntegration";
import { handleCalendarCallback } from "../lib/calendarService";
import { useAuth } from "../context/SupabaseAuthContext";
import { supabase } from "../lib/supabase";

const Calendar = () => {
  // Get the Supabase user from our auth context
  const { user } = useAuth();
  const location = useLocation();

  const [calendarSettings, setCalendarSettings] = useState(null);
  // Store integration objects for the CalendarView
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  // Store actual calendar objects with calendar info
  const [calendarsList, setCalendarsList] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [callbackProcessing, setCallbackProcessing] = useState(false);
  const [callbackError, setCallbackError] = useState(null);

  // Process OAuth callback if present in URL
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const provider = localStorage.getItem("calendarAuthProvider");

    // Process callback if parameters exist and we have a user
    if (code && state && provider && user?.id && !callbackProcessing) {
      const processOAuthCallback = async () => {
        try {
          console.log("Processing OAuth callback on Calendar page:", {
            code: code ? "PRESENT" : "NULL",
            state,
            provider,
          });

          setCallbackProcessing(true);

          // Process the callback
          const result = await handleCalendarCallback(
            provider,
            { code, state },
            user.id
          );

          console.log("Calendar connection successful:", result);

          // Important change: Save the actual calendars that were returned
          if (result.calendars && result.calendars.length > 0) {
            // Store the calendar info directly
            setCalendarsList(result.calendars);

            // Also create a fake integration object that CalendarView can use
            const fakeIntegration = {
              id: "google-integration",
              provider: "google",
              user_id: user.id,
              created_at: new Date().toISOString(),
              access_token: "present", // we don't show the actual token
              expires_at: new Date(Date.now() + 3600000).toISOString(),
            };

            setConnectedCalendars([fakeIntegration]);
          }

          // Clean up
          localStorage.removeItem("calendarAuthProvider");

          // Clear URL parameters without reloading
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (err) {
          console.error("Error processing OAuth callback:", err);
          setCallbackError(
            "Failed to connect calendar: " + (err.message || "Unknown error")
          );
        } finally {
          setCallbackProcessing(false);
        }
      };

      processOAuthCallback();
    }
  }, [user, location]);

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

      // Query without filtering by user ID first to see if any exist
      const { data: allIntegrations, error: allError } = await supabase
        .from("calendar_integrations")
        .select("*");

      console.log(
        "All calendar integrations in database:",
        allIntegrations || []
      );

      // Now try with the user ID filter
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
            // Note: In a complete implementation, we'd fetch the calendar list here
          } else {
            console.log("No connected calendars found in database");

            // Check if we have calendars from OAuth flow (stored in state)
            if (calendarsList.length > 0) {
              console.log("Using calendars from OAuth flow instead");
              // We already have calendars in state
            } else {
              setConnectedCalendars([]);
            }
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

  // Handle adding new calendar integration
  const handleAddCalendar = async (newCalendars) => {
    try {
      console.log("Adding new calendars:", newCalendars);

      // Store the actual calendar data
      if (newCalendars && newCalendars.length > 0) {
        setCalendarsList(newCalendars);

        // Create integration objects based on the calendars
        const integrations = newCalendars.map((calendar) => ({
          id: calendar.id, // Use actual Google Calendar ID
          provider: "google",
          user_id: user.id,
          calendar_id: calendar.id,
          name: calendar.name,
          created_at: new Date().toISOString(),
          access_token: "present",
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        }));

        setConnectedCalendars(integrations);
      }

      setShowCalendarModal(false);
    } catch (err) {
      console.error("Error handling new calendar:", err);
      setError("Failed to add calendar integration.");
    }
  };

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
          <p className="text-red-700">{callbackError}</p>
          <button
            className="mt-2 text-sm text-blue-600 underline"
            onClick={() => setCallbackError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Calendar Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-bold mb-2">Calendar Integration Status:</h3>
        <p>
          Connected Calendars:{" "}
          {calendarsList.length || connectedCalendars.length}
        </p>
        <p>
          Status:{" "}
          {calendarsList.length > 0
            ? "✅ Google Calendar connected successfully"
            : connectedCalendars.length > 0
              ? "✅ Calendar integration found in database"
              : "❌ No calendars connected"}
        </p>
        {calendarsList.length === 0 && connectedCalendars.length === 0 && (
          <button
            onClick={() => setShowCalendarModal(true)}
            className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
          >
            Connect Google Calendar
          </button>
        )}
      </div>

      {/* Enhanced Calendar View Component */}
      <CalendarView
        connectedCalendars={connectedCalendars}
        calendarsList={calendarsList}
        onAddCalendar={() => setShowCalendarModal(true)}
        user={user}
      />

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600">
        <strong>Debug Info:</strong>
        <br />
        URL Parameters: {window.location.search || "NONE"}
        <br />
        Provider in localStorage:{" "}
        {localStorage.getItem("calendarAuthProvider") || "NONE"}
        <br />
        Connected Calendars: {connectedCalendars.length}
        <br />
        Calendar List: {calendarsList.length}
        <br />
        User ID: {user?.id || "Not loaded"}
      </div>

      {/* Calendar Integration Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <CalendarIntegration
              onClose={() => setShowCalendarModal(false)}
              onSuccess={handleAddCalendar}
              user={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
