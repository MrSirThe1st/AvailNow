// src/components/widgets/calendar/BookingModal.jsx
import React from "react";
import { X, Phone, Mail, Globe, MessageSquare } from "lucide-react";

const BookingModal = ({
  isOpen,
  onClose,
  bookingType,
  contactInfo,
  customInstructions,
  selectedDate,
  selectedTime,
  styles,
}) => {
  if (!isOpen) return null;

  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  };

  const modalContentStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "24px",
    maxWidth: "400px",
    width: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "16px",
    paddingRight: "32px",
  };

  const sectionStyle = {
    marginBottom: "20px",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
    display: "block",
  };

  const contactItemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
  };

  const contactLinkStyle = {
    color: "#2563eb",
    textDecoration: "none",
    fontSize: "14px",
    marginLeft: "8px",
  };

  const messageStyle = {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.5",
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: styles?.bookButton?.backgroundColor || "#0070f3",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "16px",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={20} />
        </button>

        <h3 style={titleStyle}>
          {bookingType === "contact"
            ? "Contact Information"
            : customInstructions.title || "Booking Instructions"}
        </h3>

        {selectedDate && (
          <div style={sectionStyle}>
            <span style={labelStyle}>Selected Date & Time:</span>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              {formatDateForDisplay(new Date(selectedDate))}
              {selectedTime && ` at ${selectedTime}`}
            </div>
          </div>
        )}

        {bookingType === "contact" && (
          <div style={sectionStyle}>
            {contactInfo.message && (
              <div style={messageStyle}>{contactInfo.message}</div>
            )}

            <div style={{ marginTop: "16px" }}>
              {contactInfo.phone && (
                <div style={contactItemStyle}>
                  <Phone size={16} style={{ color: "#6b7280" }} />
                  <a href={`tel:${contactInfo.phone}`} style={contactLinkStyle}>
                    {contactInfo.phone}
                  </a>
                </div>
              )}

              {contactInfo.email && (
                <div style={contactItemStyle}>
                  <Mail size={16} style={{ color: "#6b7280" }} />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    style={contactLinkStyle}
                  >
                    {contactInfo.email}
                  </a>
                </div>
              )}

              {contactInfo.website && (
                <div style={contactItemStyle}>
                  <Globe size={16} style={{ color: "#6b7280" }} />
                  <a
                    href={contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={contactLinkStyle}
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            <button
              style={buttonStyle}
              onClick={() => {
                if (contactInfo.website) {
                  window.open(contactInfo.website, "_blank");
                } else if (contactInfo.phone) {
                  window.open(`tel:${contactInfo.phone}`);
                } else if (contactInfo.email) {
                  window.open(`mailto:${contactInfo.email}`);
                }
                onClose();
              }}
            >
              Contact Us Now
            </button>
          </div>
        )}

        {bookingType === "custom" && (
          <div style={sectionStyle}>
            <div style={messageStyle}>
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <MessageSquare
                  size={16}
                  style={{
                    color: "#6b7280",
                    marginRight: "8px",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  {customInstructions.message ||
                    "Please follow our booking instructions"}
                </div>
              </div>
            </div>

            <button
              style={buttonStyle}
              onClick={() => {
                if (customInstructions.actionUrl) {
                  window.open(customInstructions.actionUrl, "_blank");
                }
                onClose();
              }}
            >
              {customInstructions.buttonText || "Learn More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
