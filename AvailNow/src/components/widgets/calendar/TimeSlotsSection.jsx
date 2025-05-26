// src/components/widgets/calendar/TimeSlotsSection.jsx
import React from "react";

const TimeSlotsSection = ({
  selectedDate,
  timeSlots,
  styles,
  onBookingClick,
  onWidgetClick,
}) => {
  // Format date in a readable way
  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Handle booking click for individual time slot
  const handleBookingClick = (slot) => {
    if (onBookingClick) {
      onBookingClick(slot);
    }
  };

  if (!selectedDate) {
    return (
      <div style={styles.timeSlotsSection}>
        <div style={styles.timeSlotsEmpty}>
          Please select a date to view available times
        </div>
      </div>
    );
  }

  return (
    <div style={styles.timeSlotsSection}>
      <h3 style={styles.selectedDateTitle}>
        {formatDateForDisplay(new Date(selectedDate))}
      </h3>

      {/* Morning slots */}
      {timeSlots.morning && timeSlots.morning.length > 0 && (
        <div>
          <h4 style={styles.sectionTitle}>Morning</h4>
          <div style={styles.timeSlotsGrid}>
            {timeSlots.morning.map((slot, index) => (
              <div
                key={index}
                onClick={() => slot.available && handleBookingClick(slot)}
                style={styles.timeSlot(slot.available)}
              >
                <div style={styles.timeSlotDot(slot.available)}></div>
                <span style={styles.timeSlotText}>{slot.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Afternoon slots */}
      {timeSlots.afternoon && timeSlots.afternoon.length > 0 && (
        <div>
          <h4 style={styles.sectionTitle}>Afternoon</h4>
          <div style={styles.timeSlotsGrid}>
            {timeSlots.afternoon.map((slot, index) => (
              <div
                key={index}
                onClick={() => slot.available && handleBookingClick(slot)}
                style={styles.timeSlot(slot.available)}
              >
                <div style={styles.timeSlotDot(slot.available)}></div>
                <span style={styles.timeSlotText}>{slot.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book button */}
      <div style={styles.bookButtonContainer}>
        <button style={styles.bookButton} onClick={onWidgetClick}>
          BOOK
        </button>
      </div>
    </div>
  );
};

export default TimeSlotsSection;
