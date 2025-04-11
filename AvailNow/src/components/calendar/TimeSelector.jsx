import React from "react";
import { Clock } from "lucide-react";

const TimeSelector = ({
  value,
  onChange,
  startHour = 0,
  endHour = 23,
  interval = 30,
  label,
  className,
}) => {
  // Generate time options in 30-minute intervals (or whatever interval is specified)
  const generateTimeOptions = () => {
    const options = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinute = minute < 10 ? `0${minute}` : minute;
        const ampm = hour >= 12 ? "PM" : "AM";

        const timeString = `${formattedHour}:${formattedMinute} ${ampm}`;
        const value = `${hour < 10 ? "0" + hour : hour}:${formattedMinute}`;

        options.push({ label: timeString, value });
      }
    }

    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <Clock size={16} />
        </div>
      </div>
    </div>
  );
};

export default TimeSelector;
