// src/components/widgets/calendar/DateCellWithDotIndicator.jsx
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

  // Today indicator
  const isToday = new Date().toDateString() === date.toDateString();

  // Style for date cell
  const cellStyle = {
    position: "relative",
    height: "36px",
    width: "36px",
    padding: "2px",
    textAlign: "center",
    cursor: hasAvailability ? "pointer" : "default",
    opacity: !isInMonth ? 0.5 : 1,
    backgroundColor: isSelected ? "#EBF5FF" : "transparent",
    borderRadius: "4px",
    border: isSelected ? "1px solid #0070f3" : "none",
  };

  // Style for date number
  const dateNumberStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "20px",
    fontWeight: isSelected ? "bold" : "normal",
    color: !isInMonth ? "#9CA3AF" : isSelected ? "#0070f3" : "#1F2937",
  };

  // Style for dot container
  const dotContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "2px",
    marginTop: "2px",
  };

  return (
    <div
      style={cellStyle}
      onClick={() => hasAvailability && onClick && onClick(date)}
    >
      {/* Today indicator */}
      {isToday && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "4px",
            height: "4px",
            backgroundColor: "#0070f3",
            borderRadius: "50%",
          }}
        ></div>
      )}

      {/* Date number */}
      <div style={dateNumberStyle}>{date.getDate()}</div>

      {/* Horizontal dot indicator */}
      <div style={dotContainerStyle}>
        {availabilityPattern.slice(0, 5).map((isAvailable, index) => (
          <div
            key={index}
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: isAvailable ? "#10B981" : "#D1D5DB",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DateCellWithDotIndicator;
