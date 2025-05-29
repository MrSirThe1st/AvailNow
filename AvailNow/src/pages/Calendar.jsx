// src/pages/Calendar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Loader, AlertTriangle, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import CalendarView from "../components/calendar/CalendarView";
import CalendarIntegration from "../components/calendar/CalendarIntegration";
import {
  handleCalendarCallback,
  disconnectCalendar,
  CALENDAR_PROVIDERS,
} from "../lib/calendarService";
import { useAuth } from "../context/SupabaseAuthContext";
import { supabase } from "../lib/supabase";
import authService from "../lib/authService";
import { useCalendar } from "../context/CalendarContext";
import toast from "react-hot-toast";

const Calendar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [calendarSettings, setCalendarSettings] = useState(null);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [calendarsList, setCalendarsList] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callbackProcessing, setCallbackProcessing] = useState(false);
  const [callbackError, setCallbackError] = useState(null);
  const [deletingCalendar, setDeletingCalendar] = useState(false);

  const handleSetActiveCalendar = async (provider) => {
    setActiveCalendar(provider);
    await saveActiveCalendar(user.id, provider);
  };

  // Handle window resize to toggle between mobile and desktop views
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Restore session if needed
  useEffect(() => {
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
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const provider = localStorage.getItem("calendarAuthProvider");

      if (code && state && provider && user?.id) {
        setCallbackProcessing(true);
        navigate("/calendar", { replace: true });

        try {
          console.log(`Processing ${provider} OAuth callback...`);
          const result = await handleCalendarCallback(
            provider,
            { code, state },
            user.id
          );
          console.log("OAuth callback successful:", result);

          if (result && result.calendars) {
            const newIntegration = {
              id: `${provider}-integration-${Date.now()}`,
              provider: provider,
              user_id: user.id,
              created_at: new Date().toISOString(),
              calendar_id: "primary",
            };

            setConnectedCalendars((prev) => {
              if (!prev.some((cal) => cal.provider === provider)) {
                return [...prev, newIntegration];
              }
              return prev;
            });

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

            // Set the newly connected calendar as active
            setActiveCalendar(provider);
            await saveActiveCalendar(user.id, provider);
            toast.success(
              `${provider === "google" ? "Google Calendar" : "Microsoft Outlook"} connected successfully!`
            );
          }

          setCallbackError(null);
        } catch (err) {
          console.error("Error processing OAuth callback:", err);
          setCallbackError(
            "Failed to connect calendar: " + (err.message || "Unknown error")
          );
          toast.error("Failed to connect calendar");
        } finally {
          setCallbackProcessing(false);
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

  // Load active calendar preference from database
  const loadActiveCalendar = async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("calendar_settings")
        .select("active_calendar")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading active calendar:", error);
        return;
      }

      if (data && data.active_calendar) {
        console.log("Loaded active calendar:", data.active_calendar);
        setActiveCalendar(data.active_calendar);
      }
    } catch (err) {
      console.error("Error in loadActiveCalendar:", err);
    }
  };

  // Load active calendar whenever user changes or component mounts
  useEffect(() => {
    if (user?.id) {
      loadActiveCalendar(user.id);
    }
  }, [user]);

  // Save active calendar preference to database
  const saveActiveCalendar = async (userId, provider) => {
    try {
      const { error } = await supabase.from("calendar_settings").upsert({
        user_id: userId,
        active_calendar: provider,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving active calendar:", error);
      }
    } catch (err) {
      console.error("Error in saveActiveCalendar:", err);
    }
  };

  // Toggle calendar function - only one active at a time
  const toggleCalendar = async (provider) => {
    if (activeCalendar === provider) {
      // If clicking the active calendar, turn it off
      setActiveCalendar(null);
      await saveActiveCalendar(user.id, null);
    } else {
      // If clicking a different calendar, make it active
      setActiveCalendar(provider);
      await saveActiveCalendar(user.id, provider);
    }
  };

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

          if (userIntegrations && userIntegrations.length > 0) {
            setConnectedCalendars(userIntegrations);

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

      if (newCalendars && newCalendars.length > 0) {
        setCalendarsList((prevCalendars) => {
          const existingIds = prevCalendars.map((cal) => cal.id);
          const newUniqueCals = newCalendars.filter(
            (cal) => !existingIds.includes(cal.id)
          );
          return [...prevCalendars, ...newUniqueCals];
        });

        const provider = newCalendars[0].provider;
        const hasProvider = connectedCalendars.some(
          (cal) => cal.provider === provider
        );

        if (!hasProvider) {
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

  // Handle calendar deletion
  const handleDeleteCalendar = async (provider) => {
    setCalendarToDelete(provider);
    setShowDeleteModal(true);
  };

  const confirmDeleteCalendar = async () => {
    if (!calendarToDelete || !user?.id) return;

    try {
      setDeletingCalendar(true);

      // Disconnect the calendar using the service
      await disconnectCalendar(user.id, calendarToDelete);

      // Remove from local state
      setConnectedCalendars((prev) =>
        prev.filter((cal) => cal.provider !== calendarToDelete)
      );

      setCalendarsList((prev) =>
        prev.filter((cal) => cal.provider !== calendarToDelete)
      );

      // If this was the active calendar, clear it
      if (activeCalendar === calendarToDelete) {
        setActiveCalendar(null);
        await saveActiveCalendar(user.id, null);
      }

      toast.success(
        `${calendarToDelete === "google" ? "Google Calendar" : "Microsoft Outlook"} disconnected successfully`
      );

      setShowDeleteModal(false);
      setCalendarToDelete(null);
    } catch (err) {
      console.error("Error deleting calendar:", err);
      toast.error("Failed to disconnect calendar");
    } finally {
      setDeletingCalendar(false);
    }
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold">Disconnect Calendar</h3>
        </div>

        <p className="text-gray-600 mb-4">
          Are you sure you want to disconnect your{" "}
          {calendarToDelete === "google"
            ? "Google Calendar"
            : "Microsoft Outlook"}{" "}
          integration?
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-sm text-yellow-700">
            This will remove access to your calendar events and stop syncing
            availability data.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setCalendarToDelete(null);
            }}
            disabled={deletingCalendar}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteCalendar}
            disabled={deletingCalendar}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {deletingCalendar ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );

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

      {/* Connected Calendars Display with Toggle and Delete */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Calendar Status */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Google Calendar</h3>
            <div className="flex items-center space-x-2">
              {connectedCalendars.some((cal) => cal.provider === "google") ? (
                <>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={activeCalendar === "google"}
                      onChange={() => toggleCalendar("google")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <button
                    onClick={() => handleDeleteCalendar("google")}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                    title="Disconnect Google Calendar"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
          <p className="text-sm">
            Status:{" "}
            {connectedCalendars.some((cal) => cal.provider === "google")
              ? activeCalendar === "google"
                ? "✅ Active"
                : "⚪ Connected (Inactive)"
              : "❌ Not connected"}
          </p>
        </div>

        {/* Outlook Calendar Status */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Microsoft Outlook</h3>
            <div className="flex items-center space-x-2">
              {connectedCalendars.some((cal) => cal.provider === "outlook") ? (
                <>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={activeCalendar === "outlook"}
                      onChange={() => toggleCalendar("outlook")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <button
                    onClick={() => handleDeleteCalendar("outlook")}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                    title="Disconnect Microsoft Outlook"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="bg-indigo-500 text-white px-4 py-1 rounded"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
          <p className="text-sm">
            Status:{" "}
            {connectedCalendars.some((cal) => cal.provider === "outlook")
              ? activeCalendar === "outlook"
                ? "✅ Active"
                : "⚪ Connected (Inactive)"
              : "❌ Not connected"}
          </p>
        </div>
      </div>

      {/* Desktop Calendar View */}
      <CalendarView
        connectedCalendars={connectedCalendars.filter(
          (cal) => cal.provider === activeCalendar
        )}
        calendarsList={calendarsList}
        onAddCalendar={() => setShowCalendarModal(true)}
        user={user}
        activeCalendar={activeCalendar}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default Calendar;
