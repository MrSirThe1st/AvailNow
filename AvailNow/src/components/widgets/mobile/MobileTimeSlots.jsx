// src/components/widgets/mobile/MobileTimeSlots.jsx
import React from "react";
import { Clock } from "lucide-react";

const MobileTimeSlots = ({
  selectedDate,
  timeSlots,
  onBookSlot,
  theme,
  accentColor,
}) => {
  const styles = {
    timeSlots: {
      padding: "16px",
    },
    timeSlotsHeader: {
      marginBottom: "12px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
    },
    timeSlotsList: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "8px",
      marginTop: "12px",
    },
    timeSlot: (isAvailable) => ({
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid ${theme === "light" ? "#E5E7EB" : "#374151"}`,
      backgroundColor: isAvailable
        ? theme === "light"
          ? "#F9FAFB"
          : "#1F2937"
        : theme === "light"
          ? "#F3F4F6"
          : "#111827",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: isAvailable ? "pointer" : "default",
      opacity: isAvailable ? 1 : 0.5,
    }),
    timeText: {
      fontSize: "14px",
      fontWeight: "500",
    },
    availabilityStatus: (isAvailable) => ({
      fontSize: "10px",
      marginTop: "4px",
      color: isAvailable
        ? theme === "light"
          ? "#10B981"
          : "#34D399"
        : theme === "light"
          ? "#EF4444"
          : "#F87171",
    }),
    bookButton: {
      width: "100%",
      padding: "14px",
      backgroundColor: accentColor,
      color: "#FFFFFF",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "16px",
    },
    noAvailability: {
      textAlign: "center",
      padding: "24px 16px",
      color: theme === "light" ? "#6B7280" : "#9CA3AF",
    },
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (!selectedDate) {
    return (
      <div style={styles.noAvailability}>
        Please select a date to view available times
      </div>
    );
  }

  return (
    <div style={styles.timeSlots}>
      <div style={styles.timeSlotsHeader}>
        <Clock size={16} style={{ marginRight: "8px" }} />
        Available Times for {formatDateDisplay(selectedDate)}
      </div>

      {timeSlots.length > 0 ? (
        <>
          <div style={styles.timeSlotsList}>
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                style={styles.timeSlot(slot.available)}
                onClick={() => slot.available && onBookSlot(slot)}
              >
                <span style={styles.timeText}>{slot.time}</span>
                <span style={styles.availabilityStatus(slot.available)}>
                  {slot.available ? "Available" : "Booked"}
                </span>
              </div>
            ))}
          </div>

          <button style={styles.bookButton}>Book Appointment</button>
        </>
      ) : (
        <div style={styles.noAvailability}>
          No available time slots for this day
        </div>
      )}
    </div>
  );
};

export default MobileTimeSlots;
