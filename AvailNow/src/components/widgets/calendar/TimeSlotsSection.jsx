// src/components/widgets/calendar/TimeSlotsSection.jsx
import React, { useState } from "react";
import BookingModal from "./BookingModal";

const TimeSlotsSection = ({
  selectedDate,
  timeSlots,
  bookingType,
  contactInfo,
  customInstructions,
  styles,
  onWidgetClick,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);

  // Format date in a readable way
  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Handle time slot click
  const handleTimeSlotClick = (slot) => {
    if (slot.available) {
      setSelectedTime(slot.time);
      setShowModal(true);
    }
  };

  // Handle main booking button click
  const handleBookingClick = () => {
    setSelectedTime(null);
    setShowModal(true);
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
                onClick={() => handleTimeSlotClick(slot)}
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
                onClick={() => handleTimeSlotClick(slot)}
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
        <button style={styles.bookButton} onClick={handleBookingClick}>
          {bookingType === "contact"
            ? "CONTACT US"
            : customInstructions.buttonText || "BOOK NOW"}
        </button>
      </div>

      {/* Modal */}
      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        bookingType={bookingType}
        contactInfo={contactInfo}
        customInstructions={customInstructions}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        styles={styles}
      />
    </div>
  );
};

export default TimeSlotsSection;
