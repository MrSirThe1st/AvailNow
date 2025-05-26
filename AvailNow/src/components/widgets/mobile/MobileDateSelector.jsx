// src/components/widgets/mobile/MobileDateSelector.jsx
import React from "react";
import { Calendar } from "lucide-react";

const MobileDateSelector = ({
  availabilityData,
  selectedDate,
  onDateSelect,
  theme,
  accentColor,
}) => {
  const styles = {
    dateSelector: {
      padding: "16px",
      borderBottom: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
    },
    dateSelectorHeader: {
      marginBottom: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
    },
    datesList: {
      display: "flex",
      overflowX: "auto",
      gap: "8px",
      padding: "4px 0",
    },
    dateItem: (isSelected) => ({
      padding: "8px 0",
      width: "72px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      borderRadius: "8px",
      backgroundColor: isSelected ? `${accentColor}15` : "transparent",
      border: isSelected
        ? `1px solid ${accentColor}`
        : `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      cursor: "pointer",
    }),
    dayName: (isSelected) => ({
      fontSize: "12px",
      fontWeight: "500",
      color: isSelected
        ? accentColor
        : theme === "light"
          ? "#6B7280"
          : "#9CA3AF",
    }),
    dayNumber: (isSelected) => ({
      fontSize: "16px",
      fontWeight: isSelected ? "bold" : "normal",
      color: isSelected
        ? accentColor
        : theme === "light"
          ? "#333333"
          : "#F3F4F6",
    }),
    availability: (isAvailable) => ({
      fontSize: "10px",
      marginTop: "4px",
      padding: "2px 6px",
      borderRadius: "10px",
      backgroundColor: isAvailable
        ? theme === "light"
          ? "#DCFCE7"
          : "#065F46"
        : theme === "light"
          ? "#FEE2E2"
          : "#7F1D1D",
      color: isAvailable
        ? theme === "light"
          ? "#166534"
          : "#A7F3D0"
        : theme === "light"
          ? "#B91C1C"
          : "#FECACA",
    }),
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div style={styles.dateSelector}>
      <div style={styles.dateSelectorHeader}>
        <Calendar size={16} style={{ marginRight: "8px" }} />
        Select a Date
      </div>

      <div style={styles.datesList}>
        {availabilityData.map((day, index) => (
          <div
            key={index}
            style={styles.dateItem(
              selectedDate &&
                day.date.toDateString() === selectedDate.toDateString()
            )}
            onClick={() => day.hasAvailability && onDateSelect(day.date)}
          >
            <span
              style={styles.dayName(
                selectedDate &&
                  day.date.toDateString() === selectedDate.toDateString()
              )}
            >
              {day.dayName}
            </span>
            <span
              style={styles.dayNumber(
                selectedDate &&
                  day.date.toDateString() === selectedDate.toDateString()
              )}
            >
              {day.day}
            </span>
            <span style={styles.availability(day.hasAvailability)}>
              {day.hasAvailability
                ? `${day.availableCount} slots`
                : "Unavailable"}
            </span>
            {isToday(day.date) && (
              <span style={{ fontSize: "10px", marginTop: "2px" }}>Today</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileDateSelector;
