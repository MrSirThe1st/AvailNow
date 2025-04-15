import React, { useState, useEffect } from "react";
import { useClerkUser } from "../hooks/useClerkUser";
import { Loader } from "lucide-react";
import CalendarView from "../components/calendar/CalendarView";
import TimeSelector from "../components/calendar/TimeSelector";
import CalendarIntegration from "../components/calendar/CalendarIntegration";
import {
  getDocumentsByField,
  createDocument,
  updateDocument,
  COLLECTIONS,
} from "../lib/collections";

const Calendar = () => {
  const { user, firebaseUser } = useClerkUser();
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

  // Load data when firebase user is available
  useEffect(() => {
    if (firebaseUser) {
      loadBusinessHours();
      loadConnectedCalendars();
    }
  }, [firebaseUser]);

  // Load business hours
  const loadBusinessHours = async () => {
    if (!firebaseUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const settings = await getDocumentsByField(
        COLLECTIONS.CALENDAR_SETTINGS,
        "user_id",
        firebaseUser.uid
      );

      if (settings && settings.length > 0) {
        const data = settings[0];
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
    if (!firebaseUser) return;

    try {
      const data = await getDocumentsByField(
        COLLECTIONS.CALENDAR_INTEGRATIONS,
        "user_id",
        firebaseUser.uid
      );

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
    if (!firebaseUser) return;

    try {
      setIsSaving(true);
      setError(null);

      // Check if settings exist
      const existingSettings = await getDocumentsByField(
        COLLECTIONS.CALENDAR_SETTINGS,
        "user_id",
        firebaseUser.uid
      );

      let result;

      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        result = await updateDocument(
          COLLECTIONS.CALENDAR_SETTINGS,
          existingSettings[0].id,
          {
            availability_start_time: businessHours.startTime,
            availability_end_time: businessHours.endTime,
            working_days: businessHours.workingDays,
            updated_at: new Date().toISOString(),
          }
        );
      } else {
        // Create new settings
        result = await createDocument(
          COLLECTIONS.CALENDAR_SETTINGS,
          null, // Let Firebase generate an ID
          {
            user_id: firebaseUser.uid,
            availability_start_time: businessHours.startTime,
            availability_end_time: businessHours.endTime,
            working_days: businessHours.workingDays,
            timezone: "UTC",
            buffer_before: 0,
            buffer_after: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      }

      setCalendarSettings(result);
    } catch (err) {
      console.error("Error saving business hours:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding new calendar integration
  const handleAddCalendar = async (newCalendars) => {
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
          firebaseUser={firebaseUser}
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
              userId={firebaseUser?.uid}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
