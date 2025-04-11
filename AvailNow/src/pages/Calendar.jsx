import React, { useState } from "react";
import CalendarView from "../components/calendar/CalendarView";
import TimeSelector from "../components/calendar/TimeSelector";
import CalendarIntegration from "../components/calendar/CalendarIntegration";

const Calendar = () => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [businessHours, setBusinessHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
  });

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

            <div>
              <button className="bg-primary text-white px-4 py-2 rounded-md">
                Save Settings
              </button>
            </div>
          </div>
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
