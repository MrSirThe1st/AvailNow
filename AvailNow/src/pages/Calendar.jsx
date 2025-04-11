import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import CalendarView from "../components/calendar/CalendarView";
import TimeSelector from "../components/calendar/TimeSelector";
import CalendarIntegration from "../components/calendar/CalendarIntegration";
import { useClerkUser } from "../hooks/useClerkUser";
import { supabase } from "../lib/supabase";

const Calendar = () => {
  const { supabaseUser } = useClerkUser();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load business hours when component mounts
  useEffect(() => {
    if (supabaseUser) {
      loadBusinessHours();
    }
  }, [supabaseUser]);

  // Load the user's business hours settings
  const loadBusinessHours = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("calendar_settings")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        throw error;
      }

      if (data) {
        setBusinessHours({
          startTime: data.availability_start_time.slice(0, 5), // Convert "09:00:00" to "09:00"
          endTime: data.availability_end_time.slice(0, 5), // Convert "17:00:00" to "17:00"
          workingDays: data.working_days,
        });
      }
    } catch (err) {
      console.error("Error loading business hours:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding new connected calendars
  const handleAddCalendar = (newCalendars) => {
    setConnectedCalendars([...connectedCalendars, ...newCalendars]);
    setShowCalendarModal(false);
  };

  // Handle updating business hours
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

  // Save business hours settings
  const saveBusinessHours = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase.from("calendar_settings").upsert(
        {
          user_id: supabaseUser.id,
          availability_start_time: businessHours.startTime,
          availability_end_time: businessHours.endTime,
          working_days: businessHours.workingDays,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        throw error;
      }

      // Show success message (you might want to add a toast notification here)
    } catch (err) {
      console.error("Error saving business hours:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
