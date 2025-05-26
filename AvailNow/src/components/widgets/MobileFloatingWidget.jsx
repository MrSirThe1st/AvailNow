// src/components/widgets/MobileFloatingWidget.jsx
import React, { useState } from "react";
import { Calendar, X } from "lucide-react";
import MobileEmbedWidget from "./MobileEmbedWidget";

const MobileFloatingWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 7,
  compact = false,
  providerName = "",
  providerAddress = "",
  providerImage = "/api/placeholder/120/120",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  // Mobile floating button styles - position now at bottom right
  const buttonStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px", // Changed from left to right
    backgroundColor: accentColor,
    color: "#ffffff",
    border: "none",
    borderRadius: "50%", // Make it circular for mobile
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
    zIndex: 9999,
    transition: "all 0.3s ease",
  };

  return (
    <>
      {/* Floating Button */}
      <button
        style={buttonStyle}
        onClick={toggleWidget}
        aria-label={buttonText}
      >
        {isOpen ? <X size={24} /> : <Calendar size={24} />}
      </button>

      {/* Mobile Widget */}
      {isOpen && (
        <MobileEmbedWidget
          userId={userId}
          theme={theme}
          accentColor={accentColor}
          textColor={textColor}
          buttonText={buttonText}
          showDays={showDays}
          providerName={providerName}
          providerAddress={providerAddress}
          providerImage={providerImage}
        />
      )}
    </>
  );
};

export default MobileFloatingWidget;
