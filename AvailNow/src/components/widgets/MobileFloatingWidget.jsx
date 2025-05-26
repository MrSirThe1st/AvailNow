// src/components/widgets/MobileFloatingWidget.jsx
import React, { useState } from "react";
import { Calendar } from "lucide-react";
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

  const buttonStyle = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    backgroundColor: accentColor,
    color: "#ffffff",
    border: "none",
    borderRadius: "24px",
    padding: "12px 20px",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    cursor: "pointer",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  };

  return (
    <>
      <button style={buttonStyle} onClick={toggleWidget}>
        <Calendar size={18} />
        {buttonText}
      </button>

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
          onClose={toggleWidget}
        />
      )}
    </>
  );
};

export default MobileFloatingWidget;
