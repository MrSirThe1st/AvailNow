// src/components/widgets/calendar/BookingActionSection.jsx
import React from "react";
import { Phone, Mail, Globe, MessageSquare, Clock } from "lucide-react";

const BookingActionSection = ({
  selectedDate,
  timeSlots,
  bookingType,
  contactInfo,
  customInstructions,
  styles,
  onWidgetClick,
}) => {
  // Format date in a readable way
  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Count available slots
  const morningAvailable =
    timeSlots.morning?.filter((slot) => slot.available).length || 0;
  const afternoonAvailable =
    timeSlots.afternoon?.filter((slot) => slot.available).length || 0;
  const totalAvailable = morningAvailable + afternoonAvailable;

  if (!selectedDate) {
    return (
      <div style={styles.timeSlotsSection}>
        <div style={styles.timeSlotsEmpty}>
          Please select a date to view booking options
        </div>
      </div>
    );
  }

  return (
    <div style={styles.timeSlotsSection}>
      <h3 style={styles.selectedDateTitle}>
        {formatDateForDisplay(new Date(selectedDate))}
      </h3>

      {/* Availability Summary */}
      <div
        style={{
          backgroundColor: totalAvailable > 0 ? "#dcfce7" : "#fef2f2",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
          border: `1px solid ${totalAvailable > 0 ? "#bbf7d0" : "#fecaca"}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: totalAvailable > 0 ? "#166534" : "#dc2626",
          }}
        >
          <Clock size={16} style={{ marginRight: "8px" }} />
          <span style={{ fontWeight: "500", fontSize: "14px" }}>
            {totalAvailable > 0
              ? `${totalAvailable} available slots`
              : "No available slots"}
          </span>
        </div>
      </div>

      {/* Contact Information (for contact booking type) */}
      {bookingType === "contact" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={styles.sectionTitle}>Contact Information</h4>

          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            {contactInfo.message && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  marginBottom: "12px",
                  lineHeight: "1.5",
                }}
              >
                {contactInfo.message}
              </p>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {contactInfo.phone && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Phone
                    size={16}
                    style={{ marginRight: "8px", color: "#6b7280" }}
                  />
                  <a
                    href={`tel:${contactInfo.phone}`}
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              )}

              {contactInfo.email && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Mail
                    size={16}
                    style={{ marginRight: "8px", color: "#6b7280" }}
                  />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    {contactInfo.email}
                  </a>
                </div>
              )}

              {contactInfo.website && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Globe
                    size={16}
                    style={{ marginRight: "8px", color: "#6b7280" }}
                  />
                  <a
                    href={contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Instructions (for custom booking type) */}
      {bookingType === "custom" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={styles.sectionTitle}>
            {customInstructions.title || "Booking Instructions"}
          </h4>

          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <MessageSquare
                size={16}
                style={{
                  marginRight: "8px",
                  color: "#6b7280",
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  margin: "0",
                  lineHeight: "1.5",
                }}
              >
                {customInstructions.message ||
                  "Please follow our booking instructions"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div style={styles.bookButtonContainer}>
        <button style={styles.bookButton} onClick={onWidgetClick}>
          {bookingType === "contact" && "CONTACT US"}
          {bookingType === "custom" &&
            (customInstructions.buttonText || "LEARN MORE")}
        </button>
      </div>

      {/* Helpful text */}
      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "12px",
          color: "#6b7280",
        }}
      >
        {totalAvailable === 0
          ? "Please contact us to check for other available times"
          : `${totalAvailable} slots available - contact us to book`}
      </div>
    </div>
  );
};

export default BookingActionSection;
