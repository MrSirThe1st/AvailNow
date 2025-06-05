// src/components/widgets/settings/BusinessHoursSettings.jsx
import React from "react";
import { Clock } from "lucide-react";

const BusinessHoursSettings = ({ businessHours, onBusinessHoursChange }) => {
  const daysOfWeek = [
    { id: 0, name: "Sunday", short: "Sun" },
    { id: 1, name: "Monday", short: "Mon" },
    { id: 2, name: "Tuesday", short: "Tue" },
    { id: 3, name: "Wednesday", short: "Wed" },
    { id: 4, name: "Thursday", short: "Thu" },
    { id: 5, name: "Friday", short: "Fri" },
    { id: 6, name: "Saturday", short: "Sat" },
  ];

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const time12 = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
      timeOptions.push({ value: time24, label: time12 });
    }
  }

  const handleDayToggle = (dayId) => {
    const updatedHours = { ...businessHours };
    if (updatedHours.workingDays.includes(dayId)) {
      updatedHours.workingDays = updatedHours.workingDays.filter(
        (id) => id !== dayId
      );
    } else {
      updatedHours.workingDays = [...updatedHours.workingDays, dayId].sort();
    }
    onBusinessHoursChange(updatedHours);
  };

  const handleTimeChange = (field, value) => {
    const updatedHours = { ...businessHours, [field]: value };
    onBusinessHoursChange(updatedHours);
  };

  return (
    <div className="space-y-6">
      {/* Working Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Working Days
        </label>
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleDayToggle(day.id)}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                businessHours.workingDays.includes(day.id)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {day.short}
            </button>
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock size={16} className="inline mr-1" />
            Start Time
          </label>
          <select
            value={businessHours.startTime}
            onChange={(e) => handleTimeChange("startTime", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <select
            value={businessHours.endTime}
            onChange={(e) => handleTimeChange("endTime", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> These hours determine when time slots are
          available for booking. Calendar events will automatically block busy
          times.
        </p>
      </div>
    </div>
  );
};

export default BusinessHoursSettings;
