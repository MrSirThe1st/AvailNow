// src/components/widgets/mobile/MobileTimeSlots.jsx
import React from "react";

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
      marginBottom: "16px",
      fontWeight: "500",
      fontSize: "14px",
      color: "#374151",
    },
    timeSlotsList: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "12px",
      marginBottom: "24px",
    },
    timeSlot: (isAvailable) => ({
      padding: "12px 8px",
      borderRadius: "8px",
      border: "1px solid #E5E7EB",
      backgroundColor: isAvailable ? "#F9FAFB" : "#F3F4F6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: isAvailable ? "pointer" : "default",
      opacity: isAvailable ? 1 : 0.6,
      transition: "all 0.2s ease",
    }),
    timeText: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      textAlign: "center",
    },
    availabilityStatus: (isAvailable) => ({
      fontSize: "11px",
      marginTop: "4px",
      color: isAvailable ? "#10B981" : "#6B7280",
      textAlign: "center",
    }),
    bookButton: {
      width: "100%",
      padding: "16px",
      backgroundColor: accentColor,
      color: "#FFFFFF",
      border: "none",
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "8px",
    },
    noAvailability: {
      textAlign: "center",
      padding: "32px 16px",
      color: "#6B7280",
      fontSize: "14px",
    },
  };

  if (!selectedDate) {
    return (
      <div style={styles.noAvailability}>
        Please select a date to view available times
      </div>
    );
  }

  const availableSlots = timeSlots.filter((slot) => slot.available);

  return (
    <div style={styles.timeSlots}>
      <div style={styles.timeSlotsHeader}>Available Times</div>

      {availableSlots.length > 0 ? (
        <>
          <div style={styles.timeSlotsList}>
            {availableSlots.slice(0, 6).map((slot, index) => (
              <div
                key={index}
                style={styles.timeSlot(slot.available)}
                onClick={() => slot.available && onBookSlot(slot)}
              >
                <span style={styles.timeText}>{slot.time}</span>
                <span style={styles.availabilityStatus(slot.available)}>
                  Available
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
