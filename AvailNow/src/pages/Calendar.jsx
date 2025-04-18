// src/pages/Calendar.jsx
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import CalendarView from "../components/calendar/CalendarView";
import TimeSelector from "../components/calendar/TimeSelector";
import CalendarIntegration from "../components/calendar/CalendarIntegration";
import { useOutletContext } from "react-router-dom";

const Calendar = () => {
  // Get the user and Supabase client from the layout context
  const { user, supabaseClient } = useOutletContext();

  const [calendarSettings, setCalendarSettings] = useState(null);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load data when the component mounts and the Supabase client is available
  useEffect(() => {
    if (supabaseClient) {
      loadBusinessHours();
      loadConnectedCalendars();
    }
  }, [supabaseClient]);

  // Load business hours
  const loadBusinessHours = async () => {
    if (!supabaseClient) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from("calendar_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setCalendarSettings(data);
        setBusinessHours({
          startTime: data.availability_start_time.slice(0, 5),
          endTime: data.availability_end_time.slice(0, 5),
          workingDays: data.working_days,
        });
      } else {
        // Create default settings if none exist
        await saveBusinessHours();
      }
    } catch (err) {
      console.error("Error loading business hours:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load connected calendars
  const loadConnectedCalendars = async () => {
    if (!supabaseClient) return;

    try {
      const { data, error } = await supabaseClient
        .from("calendar_integrations")
        .select("*");

      if (error) {
        throw error;
      }

      setConnectedCalendars(data || []);
    } catch (err) {
      console.error("Error loading connected calendars:", err);
      // We don't set the error state here to avoid overriding other error messages
    }
  };

  // Handle changing business hours
  const handleBusinessHoursChange = (field, value) => {
    setBusinessHours({
      ...businessHours,
      [field]: value,
    });
  };

  // Toggle working day selection
  const toggleWorkingDay = (day) => {
    if (businessHours.workingDays.includes(day)) {
      setBusinessHours({
        ...businessHours,
        workingDays: businessHours.workingDays.filter((d) => d !== day),
      });
    } else {
      setBusinessHours({
        ...businessHours,
        workingDays: [...businessHours.workingDays, day].sort(),
      });
    }
  };

  // Save business hours
  const saveBusinessHours = async () => {
    if (!supabaseClient || !user?.id) return;

    try {
      setIsSaving(true);
      setError(null);

      const { data, error } = await supabaseClient
        .from("calendar_settings")
        .upsert({
          user_id: user.id,
          availability_start_time: businessHours.startTime,
          availability_end_time: businessHours.endTime,
          working_days: businessHours.workingDays,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setCalendarSettings(data[0]);
      }
    } catch (err) {
      console.error("Error saving business hours:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding new calendar integration
  const handleAddCalendar = async (newCalendars) => {
    if (!supabaseClient) return;

    try {
      // Refresh the list of connected calendars
      await loadConnectedCalendars();
      setShowCalendarModal(false);
    } catch (err) {
      console.error("Error handling new calendar:", err);
      setError("Failed to add calendar integration.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>

      <div className="space-y-6">
        {/* Calendar Widget */}
        <CalendarView
          connectedCalendars={connectedCalendars}
          onAddCalendar={() => setShowCalendarModal(true)}
          supabaseClient={supabaseClient}
          user={user}
        />

        {/* Business Hours Settings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Availability Settings</h2>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader size={24} className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <TimeSelector
                    label="Start Time"
                    value={businessHours.startTime}
                    onChange={(value) =>
                      handleBusinessHoursChange("startTime", value)
                    }
                    startHour={6}
                    endHour={22}
                  />
                  <TimeSelector
                    label="End Time"
                    value={businessHours.endTime}
                    onChange={(value) =>
                      handleBusinessHoursChange("endTime", value)
                    }
                    startHour={6}
                    endHour={22}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Working Days
                </label>
                <div className="flex space-x-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <button
                      key={index}
                      className={`w-10 h-10 rounded-full ${
                        businessHours.workingDays.includes(index)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      onClick={() => toggleWorkingDay(index)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Click to toggle days when you're available
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
                  onClick={saveBusinessHours}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2">Saving...</span>
                      <Loader size={16} className="animate-spin" />
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Integration Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <CalendarIntegration
              onClose={() => setShowCalendarModal(false)}
              onSuccess={handleAddCalendar}
              supabaseClient={supabaseClient}
              user={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
