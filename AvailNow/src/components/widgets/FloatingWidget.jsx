// src/components/widgets/FloatingWidget.jsx
import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import EmbedWidget from "./EmbedWidget";

const FloatingWidget = ({
  userId,
  theme = "light",
  accentColor = "#0070f3",
  textColor = "#333333",
  buttonText = "Check Availability",
  showDays = 7,
  compact = false,
  providerName = "",
  providerAddress = "",
  providerImage = "",
  companyLogo = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  // Button styles
  const buttonStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: accentColor,
    color: "#ffffff",
    border: "none",
    borderRadius: "50px",
    padding: isOpen ? "12px" : "12px 24px",
    fontWeight: "500",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  };

  // Widget container styles
  const widgetContainerStyle = {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "650px",
    maxWidth: "95vw",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    zIndex: 9998,
    display: isOpen ? "block" : "none",
    animation: "slide-up 0.3s ease",
  };

  return (
    <>
      {/* Floating Button */}
      <button style={buttonStyle} onClick={toggleWidget}>
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Calendar size={20} style={{ marginRight: "8px" }} />
            {buttonText}
          </>
        )}
      </button>

      {/* Widget Container */}
      {isOpen && (
        <div style={widgetContainerStyle}>
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
              .availnow-floating-widget {
                width: 100% !important;
                bottom: 0 !important;
                right: 0 !important;
                border-radius: 12px 12px 0 0 !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
              }
            }
          `}</style>
          <EmbedWidget
            userId={userId}
            theme={theme}
            accentColor={accentColor}
            textColor={textColor}
            buttonText={buttonText}
            showDays={showDays}
            compact={compact}
            providerName={providerName}
            providerAddress={providerAddress}
            providerImage={providerImage}
            companyLogo={companyLogo}
          />
        </div>
      )}
    </>
  );
};

export default FloatingWidget;
