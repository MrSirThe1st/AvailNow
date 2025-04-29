// DateCellWithDotIndicator.jsx
import React from "react";

/**
 * DateCell component with horizontal dot-progress indicator
 * @param {Date} date - The date to display
 * @param {Array<boolean>} availabilityPattern - Array of boolean values (true = available, false = booked)
 * @param {boolean} isSelected - Whether this date is selected
 * @param {boolean} isInMonth - Whether this date is in the current month view
 * @param {Function} onClick - Function to call when date is clicked
 */
const DateCellWithDotIndicator = ({
  date,
  availabilityPattern = [],
  isSelected = false,
  isInMonth = true,
  onClick,
}) => {
  // Calculate availability stats
  const totalSlots = availabilityPattern.length;
  const availableSlots = availabilityPattern.filter((slot) => slot).length;
  const hasAvailability = availableSlots > 0;

  // Format the date for display
  const dateNumber = date.getDate();

  // Today indicator
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div
      className={`
        relative h-10 w-full border rounded-md flex flex-col items-center justify-center
        ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
        ${hasAvailability ? "hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer" : "cursor-default"}
        ${!isInMonth ? "opacity-40" : ""}
      `}
      onClick={() => hasAvailability && onClick && onClick(date)}
    >
      {/* Today indicator */}
      {isToday && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-1"></div>
      )}

      {/* Date number */}
      <div
        className={`text-sm font-medium ${!isInMonth ? "text-gray-400" : isSelected ? "text-blue-600" : "text-gray-700"}`}
      >
        {dateNumber}
      </div>

      {/* Horizontal dot progress indicator */}
      <div className="flex space-x-0.5 mt-1">
        {availabilityPattern.map((isAvailable, index) => (
          <div
            key={index}
            className={`w-1 h-1 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}
            title={isAvailable ? "Available" : "Unavailable"}
          />
        ))}
      </div>
    </div>
  );
};

export default DateCellWithDotIndicator;
