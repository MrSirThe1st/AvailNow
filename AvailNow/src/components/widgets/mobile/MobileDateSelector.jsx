// src/components/widgets/mobile/MobileDateSelector.jsx
import React from "react";
import { Calendar, ChevronDown } from "lucide-react";

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
    },
    dateSelectorHeader: {
      marginBottom: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
      color: "#374151",
    },
    dropdown: {
      position: "relative",
      width: "100%",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #D1D5DB",
      borderRadius: "8px",
      backgroundColor: "#FFFFFF",
      fontSize: "16px",
      appearance: "none",
      cursor: "pointer",
      paddingRight: "40px",
    },
    dropdownIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "#6B7280",
    },
  };

  const formatDateOption = (date) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDateChange = (e) => {
    const selectedIndex = parseInt(e.target.value);
    const selectedDay = availabilityData[selectedIndex];
    if (selectedDay && selectedDay.hasAvailability) {
      onDateSelect(selectedDay.date);
    }
  };

  const selectedIndex = availabilityData.findIndex(
    (day) =>
      selectedDate && day.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div style={styles.dateSelector}>
      <div style={styles.dateSelectorHeader}>
        <Calendar size={16} style={{ marginRight: "8px" }} />
        Select a Date
      </div>

      <div style={styles.dropdown}>
        <select
          style={styles.select}
          value={selectedIndex >= 0 ? selectedIndex : ""}
          onChange={handleDateChange}
        >
          {availabilityData.map((day, index) => (
            <option key={index} value={index} disabled={!day.hasAvailability}>
              {formatDateOption(day.date)}
              {day.hasAvailability
                ? ` (${day.availableCount} slots)`
                : " (No availability)"}
            </option>
          ))}
        </select>
        <ChevronDown size={20} style={styles.dropdownIcon} />
      </div>
    </div>
  );
};

export default MobileDateSelector;
